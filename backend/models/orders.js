const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  customOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customization",
    default: null,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi"],
      required: true,
    },
    payment: {
      upiScreenshot: { type: String, default: "" },
      upiTransactionId: { type: String, default: "" },
      verified: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      verifiedAt: { type: Date },
      notes: { type: String, default: "" },
      rejectedReason: { type: String, default: "" },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: { type: String, default: "" },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 40 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "Payment Verification Pending",
        "Order Placed",
        "Confirmed",
        "Preparing",
        "Ready to Ship",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },
    statusHistory: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    cancellationReason: { type: String, default: "" },
    gift: {
      recipientName: { type: String, default: "", trim: true, maxlength: 100 },
      message: { type: String, default: "", trim: true, maxlength: 300 },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
