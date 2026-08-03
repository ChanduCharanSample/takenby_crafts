const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"] },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    videoLink: { type: String, default: "" },
    reelLink: { type: String, default: "" },
    priority: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    published: { type: Boolean, default: true },
    pinned: { type: Boolean, default: false },
    type: {
      type: String,
      default: "general",
      enum: [
        "general",
        "festival",
        "offer",
        "workshop",
        "holiday",
        "order-delay",
        "popup-stall",
        "new-collection",
        "delivery",
      ],
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
