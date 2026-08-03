import React, { useState } from "react";
import { FaInstagram, FaWhatsapp, FaYoutube, FaFacebook, FaPinterest, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useContent } from "../../context/ContentContext";

const AdminSocial = () => {
  const { social, refresh } = useContent();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    instagram: social?.instagram || "",
    whatsapp: social?.whatsapp || "",
    youtube: social?.youtube || "",
    facebook: social?.facebook || "",
    pinterest: social?.pinterest || "",
    maps: social?.maps || "",
    website: social?.website || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contentService.updateSocial(form);
      await refresh();
      showToast("Social links saved", "success");
    } catch (err) {
      showToast(getMessage(err, "Could not save"), "error");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "instagram", label: "Instagram", icon: <FaInstagram /> },
    { key: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp /> },
    { key: "youtube", label: "YouTube", icon: <FaYoutube /> },
    { key: "facebook", label: "Facebook", icon: <FaFacebook /> },
    { key: "pinterest", label: "Pinterest", icon: <FaPinterest /> },
    { key: "maps", label: "Google Maps", icon: <FaMapMarkerAlt /> },
    { key: "website", label: "Website", icon: <FaGlobe /> },
  ];

  return (
    <div className="dash-content">
      <h1>Social Links</h1>
      <p className="dash-sub">Links shown in the footer and on the homepage.</p>

      <form onSubmit={handleSubmit}>
        <div className="dash-panel">
          <h3>Profiles</h3>
          <div className="form-grid">
            {fields.map((f) => (
              <div className="form-group" key={f.key}>
                <label>{f.icon} {f.label}</label>
                <input
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.key === "whatsapp" ? "https://wa.me/919876543210" : `https://...`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="dash-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Links"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSocial;
