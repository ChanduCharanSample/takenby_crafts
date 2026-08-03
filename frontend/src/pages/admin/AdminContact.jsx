import React, { useState } from "react";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useContent } from "../../context/ContentContext";

const AdminContact = () => {
  const { contact, refresh } = useContent();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    heading: contact?.heading || "Contact Us",
    subtitle: contact?.subtitle || "",
    addressStreet: contact?.address?.street || "",
    addressCity: contact?.address?.city || "",
    addressState: contact?.address?.state || "",
    addressPincode: contact?.address?.pincode || "",
    phone: contact?.phone || "",
    whatsapp: contact?.whatsapp || "",
    email: contact?.email || "",
    instagram: contact?.instagram || "",
    mapsEmbed: contact?.mapsEmbed || "",
    mapsLink: contact?.mapsLink || "",
    hours: contact?.hours || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        heading: form.heading,
        subtitle: form.subtitle,
        address: {
          street: form.addressStreet,
          city: form.addressCity,
          state: form.addressState,
          pincode: form.addressPincode,
        },
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        instagram: form.instagram,
        mapsEmbed: form.mapsEmbed,
        mapsLink: form.mapsLink,
        hours: form.hours,
      };
      await contentService.updateContact(payload);
      await refresh();
      showToast("Contact page saved", "success");
    } catch (err) {
      showToast(getMessage(err, "Could not save"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dash-content">
      <h1>Contact Page</h1>
      <p className="dash-sub">Contact details shown on the contact page.</p>

      <form onSubmit={handleSubmit}>
        <div className="dash-panel">
          <h3>Header</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Heading</label>
              <input value={form.heading} onChange={(e) => set("heading", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Subtitle</label>
              <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <h3>Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="form-group">
              <label>WhatsApp (digits only)</label>
              <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Instagram URL</label>
              <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Business Hours</label>
              <input value={form.hours} onChange={(e) => set("hours", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Maps Embed URL</label>
              <input value={form.mapsEmbed} onChange={(e) => set("mapsEmbed", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Maps Link</label>
              <input value={form.mapsLink} onChange={(e) => set("mapsLink", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Street / Area</label>
              <input value={form.addressStreet} onChange={(e) => set("addressStreet", e.target.value)} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input value={form.addressCity} onChange={(e) => set("addressCity", e.target.value)} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input value={form.addressState} onChange={(e) => set("addressState", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input value={form.addressPincode} onChange={(e) => set("addressPincode", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="dash-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Contact"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminContact;
