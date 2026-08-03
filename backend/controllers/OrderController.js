const Order = require("../models/orders");
const Cart = require("../models/carts");
const Product = require("../models/products");
const Coupon = require("../models/coupons");
const Customization = require("../models/customizations");
const Settings = require("../models/settings");
const InventoryLog = require("../models/inventorylog");
const { sendOrderConfirmationEmail } = require("../services/emailService");

const VALID_STATUSES = [
  "Order Placed",
  "Confirmed",
  "Preparing",
  "Ready to Ship",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const logInventory = async (productId, productName, changeType, quantityChange, stockAfter, note, userId) => {
  try {
    await InventoryLog.create({
      product: productId,
      productName,
      changeType,
      quantityChange,
      stockAfter,
      note,
      user: userId,
    });
  } catch (e) {}
};

// @desc   Create an order from the cart
// @route  POST /api/orders
// @access Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, payment, customItems, gift } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res
        .status(400)
        .json({ success: false, message: "Shipping address is required" });
    }

    if (!["cod", "upi"].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }

    if (paymentMethod === "upi" && !payment?.upiScreenshot) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload the UPI payment screenshot" });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price discount stock images"
    );
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Your cart is empty" });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" is out of stock`,
        });
      }
      const price = product.finalPrice;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || "",
        price,
        quantity: item.quantity,
      });
    }

    let discount = 0;
    let couponCode = "";
    if (cart.coupon) {
      const coupon = await Coupon.findById(cart.coupon);
      if (coupon && coupon.isActive && new Date(coupon.expiryDate) > new Date()) {
        if (subtotal >= coupon.minOrder) {
          discount =
            coupon.discountType === "percentage"
              ? (subtotal * coupon.discountValue) / 100
              : coupon.discountValue;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          discount = Math.round(discount);
          couponCode = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const settings = await Settings.findOne();
    const deliveryCharge = settings
      ? subtotal - discount >= settings.freeDeliveryLimit
        ? 0
        : settings.deliveryCharges
      : subtotal - discount >= 999
      ? 0
      : 40;
    const total = subtotal - discount + deliveryCharge;

    const isUpi = paymentMethod === "upi";
    const isCod = paymentMethod === "cod";

    let order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      payment: {
        upiScreenshot: payment?.upiScreenshot || "",
        upiTransactionId: payment?.upiTransactionId || "",
        verified: isUpi ? "pending" : "pending",
        notes: payment?.notes || "",
      },
      paymentStatus: isUpi ? "paid" : "pending",
      paymentId: payment?.upiTransactionId || "",
      subtotal,
      discount,
      deliveryCharge,
      total,
      couponCode,
      status: isUpi ? "Payment Verification Pending" : "Order Placed",
      statusHistory: [{ status: isUpi ? "Payment Verification Pending" : "Order Placed" }],
      gift: gift && (gift.recipientName || gift.message)
        ? {
            recipientName: String(gift.recipientName || "").slice(0, 100),
            message: String(gift.message || "").slice(0, 300),
          }
        : undefined,
    });

    for (const item of cart.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity, salesCount: item.quantity },
        });
        await logInventory(
          item.product._id,
          item.product.name,
          "order",
          -item.quantity,
          item.product.stock - item.quantity,
          `Order ${order._id}`,
          req.user._id
        );
      }
    }

    if (customItems && customItems.length) {
      for (const cItem of customItems) {
        await Customization.findByIdAndUpdate(cItem.customizationId, {
          status: "In Progress",
          orderId: order._id,
        });
      }
    }

    await Cart.findByIdAndUpdate(cart._id, { items: [], coupon: null });

    sendOrderConfirmationEmail({
      email: req.user.email,
      name: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.email,
      order,
    });

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get orders of logged in user
// @route  GET /api/orders/my-orders
// @access Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Get user orders error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single order
// @route  GET /api/orders/:id
// @access Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "firstName lastName email phone"
    );
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = String(order.user._id) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Get order error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Cancel order (customer, only before shipped)
// @route  PUT /api/orders/:id/cancel
// @access Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to cancel this order" });
    }

    const cancellable = ["Order Placed", "Confirmed", "Preparing", "Payment Verification Pending"];
    if (!cancellable.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order can only be cancelled before it is shipped",
      });
    }

    order.status = "Cancelled";
    order.cancellationReason = req.body.reason || "";
    order.statusHistory.push({ status: "Cancelled" });
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, salesCount: -item.quantity },
      });
      await logInventory(
        item.product,
        item.name,
        "cancel",
        item.quantity,
        null,
        `Order cancelled (${order._id})`,
        req.user._id
      );
    }

    res.json({ success: true, message: "Order cancelled", order });
  } catch (error) {
    console.error("Cancel order error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reorder items (add products back to cart)
// @route  POST /api/orders/:id/reorder
// @access Private
const reorder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (String(order.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive || product.isArchived) continue;
      const existing = cart.items.find(
        (i) => String(i.product) === String(product._id)
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        cart.items.push({
          product: product._id,
          quantity: item.quantity,
          price: product.finalPrice,
        });
      }
    }
    await cart.save();
    res.json({ success: true, message: "Items added back to your cart" });
  } catch (error) {
    console.error("Reorder error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update order status (admin)
// @route  PUT /api/orders/:id/status
// @access Private (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "Payment Verification Pending" && status !== "Confirmed" && status !== "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Verify the payment before updating the order status",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cancelled orders cannot be updated" });
    }
    if (order.status === "Delivered") {
      return res.status(400).json({ success: false, message: "Delivered orders cannot be updated" });
    }

    order.status = status;
    order.statusHistory.push({ status });
    if (status === "Cancelled") {
      order.cancellationReason = reason || "";
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
        await logInventory(
          item.product,
          item.name,
          "cancel",
          item.quantity,
          null,
          `Order cancelled by admin (${order._id})`,
          req.user._id
        );
      }
    }
    await order.save();
    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Update order status error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Verify UPI payment (admin)
// @route  PUT /api/orders/:id/verify-payment
// @access Private (admin)
const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const { approve, notes } = req.body;

    if (approve) {
      order.payment.verified = "approved";
      order.payment.verifiedAt = new Date();
      order.paymentStatus = "paid";
      order.status = "Confirmed";
      order.statusHistory.push({ status: "Confirmed" });
      if (notes) order.payment.notes = notes;
      await order.save();
      return res.json({ success: true, message: "Payment approved, order confirmed", order });
    }

    order.payment.verified = "rejected";
    order.payment.rejectedReason = notes || "";
    order.paymentStatus = "failed";
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, salesCount: -item.quantity },
      });
      await logInventory(
        item.product,
        item.name,
        "cancel",
        item.quantity,
        null,
        `Payment rejected for order ${order._id}`,
        req.user._id
      );
    }
    res.json({ success: true, message: "Payment rejected, order cancelled", order });
  } catch (error) {
    console.error("Verify payment error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all orders (admin)
// @route  GET /api/orders
// @access Private (admin)
const getAllOrders = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Get all orders error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get orders pending payment verification (admin)
// @route  GET /api/orders/pending-payments
// @access Private (admin)
const getPendingPayments = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Payment Verification Pending" })
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get inventory logs (admin)
// @route  GET /api/orders/inventory-logs
// @access Private (admin)
const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find()
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  reorder,
  updateOrderStatus,
  verifyPayment,
  getAllOrders,
  getPendingPayments,
  getInventoryLogs,
};
