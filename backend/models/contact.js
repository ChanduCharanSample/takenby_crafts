const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "Contact Us" },
    subtitle: { type: String, default: "We'd love to hear from you." },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    instagram: { type: String, default: "" },
    mapsEmbed: { type: String, default: "" },
    mapsLink: { type: String, default: "" },
    hours: { type: String, default: "" },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
