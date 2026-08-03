import React, { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaWhatsapp,
  FaInstagram,
  FaClock,
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useContent } from "../context/ContentContext";
import { getImageUrl } from "../utils/helpers";

const Contact = () => {
  const { showToast } = useToast();
  const { settings, contact, social } = useContent();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const heading = contact?.heading || "Contact Us";
  const subtitle = contact?.subtitle || "Questions, custom ideas or collaboration? We'd love to hear from you.";
  const phone = contact?.phone || settings?.phone || "+91 98765 43210";
  const whatsapp = contact?.whatsapp || settings?.whatsapp || "919876543210";
  const email = contact?.email || settings?.email || "hello@takenbycrafts.com";
  const address = {
    street: contact?.address?.street || settings?.address?.street || "",
    city: contact?.address?.city || settings?.address?.city || "",
    state: contact?.address?.state || settings?.address?.state || "",
    pincode: contact?.address?.pincode || settings?.address?.pincode || "",
  };
  const hours = contact?.hours || settings?.businessHours || "Mon–Sat, 10am–7pm";
  const instagram = social?.instagram || settings?.instagramUsername
    ? `https://instagram.com/${settings?.instagramUsername || "takenby_crafts"}`
    : "";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast("Message sent! Our team will get back to you soon 💌", "success");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const waLink = `https://wa.me/${String(whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello ${settings?.websiteName || "TakenBy_Crafts"}! I have a question.`
  )}`;

  return (
    <div>
      <div className="page-banner">
        <div className="container">
          <h1>{heading}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="container section contact-layout">
        <div className="contact-info">
          <div className="contact-card">
            <FaPhone />
            <div>
              <h4>Call Us</h4>
              <p>{phone}</p>
              <p>{hours}</p>
            </div>
          </div>
          <div className="contact-card">
            <FaWhatsapp />
            <div>
              <h4>WhatsApp Us</h4>
              <p>
                <a href={waLink} target="_blank" rel="noreferrer">
                  {whatsapp}
                </a>
              </p>
              <p>Quickest way to reach us</p>
            </div>
          </div>
          <div className="contact-card">
            <FaEnvelope />
            <div>
              <h4>Email Us</h4>
              <p>{email}</p>
              <p>We reply within 24 hours</p>
            </div>
          </div>
          <div className="contact-card">
            <FaClock />
            <div>
              <h4>Business Hours</h4>
              <p>{hours}</p>
              <p>Closed on Sundays</p>
            </div>
          </div>
          <div className="contact-card">
            <FaMapMarkerAlt />
            <div>
              <h4>Visit Us</h4>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} — {address.pincode}</p>
            </div>
          </div>
          {instagram && (
            <div className="contact-card">
              <FaInstagram />
              <div>
                <h4>Follow Us</h4>
                <p>
                  <a href={instagram} target="_blank" rel="noreferrer">
                    @{settings?.instagramUsername || "takenby_crafts"}
                  </a>
                </p>
                <p>Behind the scenes & new drops</p>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-card contact-form-card">
          <h3>Send a Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Your Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="Custom order / Order help / Other" />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea rows="5" name="message" value={form.message} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary">
              <FaPaperPlane /> Send Message
            </button>
          </form>
          {contact?.mapsEmbed && (
            <div className="contact-map">
              <iframe
                src={getImageUrl(contact.mapsEmbed) || contact.mapsEmbed}
                title="Location map"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
