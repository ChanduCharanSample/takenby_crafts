const mongoose = require("mongoose");

const inventorylogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, default: "" },
    changeType: {
      type: String,
      enum: ["restock", "deduct", "adjust", "order", "cancel", "sale"],
      default: "adjust",
    },
    quantityChange: { type: Number, default: 0 },
    stockAfter: { type: Number, default: 0 },
    note: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

inventorylogSchema.index({ product: 1, createdAt: -1 });

const InventoryLog = mongoose.model("InventoryLog", inventorylogSchema);
module.exports = InventoryLog;
