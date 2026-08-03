const Cart = require("../models/carts");
const Product = require("../models/products");
const Coupon = require("../models/coupons");

const getCartForUser = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price discount stock images customizable category"
  );
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const recalcDiscount = async (cart) => {
  cart.discount = 0;
  cart.couponCode = "";
  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon && coupon.isActive) {
      const subtotal = cart.subtotal;
      if (subtotal >= coupon.minOrder) {
        let discount =
          coupon.discountType === "percentage"
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        cart.discount = Math.round(discount);
        cart.couponCode = coupon.code;
      }
    }
  }
  return cart;
};

// @desc   Get user cart
// @route  GET /api/cart
// @access Private
const getCart = async (req, res) => {
  try {
    let cart = await getCartForUser(req.user._id);
    cart = await recalcDiscount(cart);
    await cart.save();
    const subtotal = cart.subtotal;
    const discount = cart.discount || 0;
    const deliveryCharge = subtotal > 0 ? (subtotal - discount >= 999 ? 0 : 40) : 0;
    const total = subtotal - discount + deliveryCharge;
    res.json({
      success: true,
      cart,
      subtotal,
      discount,
      deliveryCharge,
      total,
      couponCode: cart.couponCode,
      count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("Get cart error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Add item to cart
// @route  POST /api/cart
// @access Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = quantity ? parseInt(quantity) : 1;

    if (qty < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.stock < qty) {
      return res
        .status(400)
        .json({ success: false, message: "Only " + product.stock + " items in stock" });
    }

    let cart = await getCartForUser(req.user._id);

    const existing = cart.items.find(
      (i) => String(i.product._id) === String(productId)
    );

    if (existing) {
      if (product.stock < existing.quantity + qty) {
        return res.status(400).json({
          success: false,
          message: "Only " + product.stock + " items in stock",
        });
      }
      existing.quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        price: product.finalPrice,
      });
    }

    await cart.save();
    const result = await getCart(req, res);
    return result;
  } catch (error) {
    console.error("Add to cart error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update cart item quantity
// @route  PUT /api/cart/:productId
// @access Private
const updateCartItem = async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    let cart = await getCartForUser(req.user._id);
    const item = cart.items.find(
      (i) => String(i.product._id) === String(req.params.productId)
    );
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Only " + product.stock + " items in stock",
      });
    }

    item.quantity = quantity;
    await cart.save();
    const result = await getCart(req, res);
    return result;
  } catch (error) {
    console.error("Update cart error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Remove item from cart
// @route  DELETE /api/cart/:productId
// @access Private
const removeFromCart = async (req, res) => {
  try {
    let cart = await getCartForUser(req.user._id);
    cart.items = cart.items.filter(
      (i) => String(i.product._id) !== String(req.params.productId)
    );
    await cart.save();
    const result = await getCart(req, res);
    return result;
  } catch (error) {
    console.error("Remove from cart error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Clear cart
// @route  DELETE /api/cart
// @access Private
const clearCart = async (req, res) => {
  try {
    let cart = await getCartForUser(req.user._id);
    cart.items = [];
    cart.coupon = null;
    await cart.save();
    res.json({ success: true, message: "Cart cleared", cart });
  } catch (error) {
    console.error("Clear cart error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Apply coupon
// @route  POST /api/cart/coupon
// @access Private
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid coupon code" });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Coupon is inactive" });
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    let cart = await getCartForUser(req.user._id);
    if (cart.subtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
      });
    }

    cart.coupon = coupon._id;
    await cart.save();
    cart = await recalcDiscount(cart);
    await cart.save();

    res.json({
      success: true,
      message: `Coupon ${coupon.code} applied`,
      discount: cart.discount,
      couponCode: coupon.code,
    });
  } catch (error) {
    console.error("Apply coupon error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Remove coupon
// @route  DELETE /api/cart/coupon
// @access Private
const removeCoupon = async (req, res) => {
  try {
    let cart = await getCartForUser(req.user._id);
    cart.coupon = null;
    await cart.save();
    res.json({ success: true, message: "Coupon removed" });
  } catch (error) {
    console.error("Remove coupon error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
};
