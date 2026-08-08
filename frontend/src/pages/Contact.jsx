import React, { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaWhatsapp,
  FaInstagram,
  FaClock,
  FaGlobe,
  FaDirections,
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useContent } from "../context/ContentContext";
import { contactMessageService } from "../services";
import { getMessage } from "../services/api";
import { getImageUrl } from "../utils/helpers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contact = () => {
  const { showToast } = useToast();
  const { settings, contact, social } = useContent();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const heading = contact?.heading || "Contact Us";
  const subtitle = contact?.subtitle || "";
  const phone = contact?.phone || settings?.phone || "";
  const whatsapp = contact?.whatsapp || settings?.whatsapp || "";
  const email = contact?.email || settings?.email || "";
  const address = {
    street: contact?.address?.street || settings?.address?.street || "",
    city: contact?.address?.city || settings?.address?.city || "",
    state: contact?.address?.state || settings?.address?.state || "",
    pincode: contact?.address?.pincode || settings?.address?.pincode || "",
  };
  const hours = contact?.hours || settings?.businessHours || "";
  const hasAddress = address.street || address.city || address.state || address.pincode;
  const instagram = (social?.instagram || "").trim() || (settings?.instagramUsername
    ? `https://instagram.com/${settings.instagramUsername}`
    : "");
  const mapsLink = (social?.maps || "").trim();
  const websiteLink = (social?.website || "").trim();
  const websiteName = settings?.websiteName || "TakenBy_Crafts";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Please enter your name";
    if (!form.email.trim()) er.email = "Please enter your email";
    else if (!EMAIL_REGEX.test(form.email.trim())) er.email = "Please enter a valid email address";
    if (form.phone && form.phone.replace(/\D/g, "").length < 10)
      er.phone = "Please enter a valid phone number";
    if (!form.message.trim()) er.message = "Please enter your message";
    else if (form.message.trim().length < 10)
      er.message = "Message should be at least 10 characters";
    return er;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    setSending(true);
    try {
      await contactMessageService.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      showToast("Message sent! Our team will get back to you soon 💌", "success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      showToast(getMessage(err, "Could not send your message. Please try again."), "error");
    } finally {
      setSending(false);
    }
  };

  const waLink = whatsapp
    ? `https://wa.me/${String(whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hello ${websiteName}! I have a question.`
      )}`
    : "";

  const hasInfo = phone || whatsapp || email || hours || hasAddress || instagram || mapsLink || websiteLink;

  return (
    <div>
      <div className="page-banner">
        <div className="container">
          <h1>{heading}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className={`container section ${hasInfo ? "contact-layout" : ""}`}>
        {hasInfo && (
          <div className="contact-info">
            {phone && (
              <div className="contact-card">
                <FaPhone />
                <div>
                  <h4>Call Us</h4>
                  <p>{phone}</p>
                  {hours && <p>{hours}</p>}
                </div>
              </div>
            )}
            {whatsapp && (
              <div className="contact-card">
                <FaWhatsapp />
                <div>
                  <h4>WhatsApp Us</h4>
                  <p>
                    {waLink ? (
                      <a href={waLink} target="_blank" rel="noreferrer">
                        {whatsapp}
                      </a>
                    ) : (
                      whatsapp
                    )}
                  </p>
                  <p>Quickest way to reach us</p>
                </div>
              </div>
            )}
            {email && (
              <div className="contact-card">
                <FaEnvelope />
                <div>
                  <h4>Email Us</h4>
                  <p>{email}</p>
                  <p>We reply within 24 hours</p>
                </div>
              </div>
            )}
            {hours && (
              <div className="contact-card">
                <FaClock />
                <div>
                  <h4>Business Hours</h4>
                  <p>{hours}</p>
                </div>
              </div>
            )}
            {hasAddress && (
              <div className="contact-card">
                <FaMapMarkerAlt />
                <div>
                  <h4>Visit Us</h4>
                  <p>{address.street}</p>
                  <p>
                    {[address.city, address.state, address.pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}
            {mapsLink && (
              <div className="contact-card">
                <FaDirections />
                <div>
                  <h4>Get Directions</h4>
                  <p>
                    <a href={mapsLink} target="_blank" rel="noreferrer">
                      Open in Google Maps
                    </a>
                  </p>
                  <p>Plan your visit to our studio</p>
                </div>
              </div>
            )}
            {websiteLink && (
              <div className="contact-card">
                <FaGlobe />
                <div>
                  <h4>Visit Our Website</h4>
                  <p>
                    <a href={websiteLink} target="_blank" rel="noreferrer">
                      {websiteName}
                    </a>
                  </p>
                  <p>Explore our full collection online</p>
                </div>
              </div>
            )}
            {instagram && (
              <div className="contact-card">
                <FaInstagram />
                <div>
                  <h4>Follow Us</h4>
                  <p>
                    <a href={instagram} target="_blank" rel="noreferrer">
                      {instagram.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </p>
                  <p>Behind the scenes & new drops</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="checkout-card contact-form-card">
          <h3>Send a Message</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Your Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Phone (optional)</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Custom order / Order help / Other"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea
                rows="5"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us what you're looking for..."
              />
              {errors.message && <span className="field-error">{errors.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <FaPaperPlane /> {sending ? "Sending..." : "Send Message"}
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
