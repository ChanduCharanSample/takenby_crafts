const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Reel = mongoose.model("Reel", reelSchema);
module.exports = Reel;
