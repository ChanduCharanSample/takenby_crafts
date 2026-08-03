const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customText: { type: String, default: "", trim: true },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
    theme: { type: String, default: "" },
    occasion: { type: String, default: "" },
    specialInstructions: { type: String, default: "" },
    referenceImage: { type: String, default: "" },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    customPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Approved",
        "Rejected",
        "Awaiting Payment",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    customMessage: { type: String, default: "" },
    rejectedReason: { type: String, default: "" },
    estimatedPrice: { type: Number, default: 0 },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true }
);

const Customization = mongoose.model("Customization", customizationSchema);
module.exports = Customization;
