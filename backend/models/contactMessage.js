const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Unread", "Read", "Replied", "Archived"],
      default: "Unread",
    },
    readAt: { type: Date, default: null },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ createdAt: -1 });

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
module.exports = ContactMessage;
