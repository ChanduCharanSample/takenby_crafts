const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    story: { type: String, default: "" },
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    journey: { type: String, default: "" },
    achievements: [{ type: String }],
    certificates: [{ type: String }],
    galleryImages: [{ type: String }],
    workshopImages: [{ type: String }],
    stallPhotos: [{ type: String }],
  },
  { timestamps: true }
);

const About = mongoose.model("About", aboutSchema);
module.exports = About;
