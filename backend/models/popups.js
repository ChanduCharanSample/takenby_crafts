const mongoose = require("mongoose");

const popupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      default: "",
    },
    buttonUrl: {
      type: String,
      default: "",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    display: {
      type: String,
      default: "once-session",
      enum: ["once-session", "every-visit", "daily", "disabled"],
    },
  },
  { timestamps: true }
);

const Popup = mongoose.model("Popup", popupSchema);
module.exports = Popup;
