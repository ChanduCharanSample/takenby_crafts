const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    image: { type: String, required: [true, "Image is required"] },
    caption: { type: String, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Gallery = mongoose.model("Gallery", gallerySchema);
module.exports = Gallery;
