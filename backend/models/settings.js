const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    websiteName: { type: String, default: "TakenBy_Crafts" },
    tagline: { type: String, default: "Handmade Arts & Crafts by TakenBy_Crafts" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    primaryColor: { type: String, default: "#c77b5a" },
    accentColor: { type: String, default: "#8a9a7b" },
    font: { type: String, default: "Playfair Display + Jost" },
    phone: { type: String, default: "+91 98765 43210" },
    whatsapp: { type: String, default: "919876543210" },
    email: { type: String, default: "hello@takenbycrafts.com" },
    instagramUsername: { type: String, default: "takenby_crafts" },
    address: {
      street: { type: String, default: "Craft Studio, Craft Lane" },
      city: { type: String, default: "Jaipur" },
      state: { type: String, default: "Rajasthan" },
      pincode: { type: String, default: "302001" },
    },
    mapsEmbed: { type: String, default: "" },
    deliveryCharges: { type: Number, default: 40 },
    freeDeliveryLimit: { type: Number, default: 999 },
    upiId: { type: String, default: "takenbycrafts@upi" },
    upiName: { type: String, default: "TakenBy_Crafts" },
    qrCode: { type: String, default: "" },
    businessHours: { type: String, default: "Mon–Sat, 10:00 AM – 7:00 PM" },
    ownerName: { type: String, default: "Chandrika" },
    about: { type: String, default: "" },
    copyrightText: { type: String, default: "All rights reserved." },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
module.exports = Settings;
