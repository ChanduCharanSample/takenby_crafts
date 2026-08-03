const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    aboutText: { type: String, default: "" },
    quickLinks: [
      {
        label: { type: String },
        url: { type: String },
      },
    ],
    customerCareLinks: [
      {
        label: { type: String },
        url: { type: String },
      },
    ],
    policyLinks: [
      {
        label: { type: String },
        url: { type: String },
      },
    ],
    showSocial: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Footer = mongoose.model("Footer", footerSchema);
module.exports = Footer;
