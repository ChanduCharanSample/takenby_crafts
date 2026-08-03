const mongoose = require("mongoose");

const sociallinksSchema = new mongoose.Schema(
  {
    instagram: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    youtube: { type: String, default: "" },
    facebook: { type: String, default: "" },
    pinterest: { type: String, default: "" },
    maps: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { timestamps: true }
);

const SocialLinks = mongoose.model("SocialLinks", sociallinksSchema);
module.exports = SocialLinks;
