import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import { useContent } from "../../context/ContentContext";

const SECTION_DEFS = [
  { key: "galleryImages", label: "Studio Gallery Images" },
  { key: "workshopImages", label: "Workshop Images" },
  { key: "stallPhotos", label: "Craft Stall Photos" },
];

const AdminAbout = () => {
  const { about, refresh } = useContent();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    story: about?.story || "",
    mission: about?.mission || "",
    vision: about?.vision || "",
    journey: about?.journey || "",
    achievements: (about?.achievements || []).join("\n"),
    certificates: (about?.certificates || []).join("\n"),
  });
  const [newFiles, setNewFiles] = useState({ galleryImages: [], workshopImages: [], stallPhotos: [] });
  const [removed, setRemoved] = useState({ galleryImages: [], workshopImages: [], stallPhotos: [] });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFiles = (section, e) => {
    setNewFiles((prev) => ({ ...prev, [section]: [...prev[section], ...Array.from(e.target.files)] }));
  };

  const removeExisting = (section, img) => {
    setRemoved((prev) => ({ ...prev, [section]: [...prev[section], img] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      const payload = {
        story: form.story,
        mission: form.mission,
        vision: form.vision,
        journey: form.journey,
        achievements: form.achievements.split("\n").map((s) => s.trim()).filter(Boolean),
        certificates: form.certificates.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      Object.keys(removed).forEach((section) => {
        if (removed[section].length) payload[`remove${section[0].toUpperCase()}${section.slice(1)}`] = removed[section];
      });
      fd.append("data", JSON.stringify(payload));
      Object.keys(newFiles).forEach((section) => {
        newFiles[section].forEach((f) => fd.append(section, f));
      });
      await contentService.updateAbout(fd);
      await refresh();
      showToast("About page saved", "success");
      setNewFiles({ galleryImages: [], workshopImages: [], stallPhotos: [] });
      setRemoved({ galleryImages: [], workshopImages: [], stallPhotos: [] });
    } catch (err) {
      showToast(getMessage(err, "Could not save"), "error");
    } finally {
      setSaving(false);
    }
  };

  const existing = (section) => (about?.[section] || []).filter((img) => !removed[section].includes(img));

  return (
    <div className="dash-content">
      <h1>About Page</h1>
      <p className="dash-sub">Your story, mission, and studio photos.</p>

      <form onSubmit={handleSubmit}>
        <div className="dash-panel">
          <h3>Content</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label>Our Story *</label>
              <textarea rows="5" value={form.story} onChange={(e) => set("story", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Mission</label>
              <textarea rows="3" value={form.mission} onChange={(e) => set("mission", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Vision</label>
              <textarea rows="3" value={form.vision} onChange={(e) => set("vision", e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Journey</label>
              <textarea rows="3" value={form.journey} onChange={(e) => set("journey", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Achievements (one per line)</label>
              <textarea rows="5" value={form.achievements} onChange={(e) => set("achievements", e.target.value)} placeholder={"Best Handmade Brand 2025\n2000+ Happy Customers"} />
            </div>
            <div className="form-group">
              <label>Certificates (one per line)</label>
              <textarea rows="5" value={form.certificates} onChange={(e) => set("certificates", e.target.value)} placeholder="Certificate of Excellence" />
            </div>
          </div>
        </div>

        {SECTION_DEFS.map((section) => (
          <div className="dash-panel" key={section.key}>
            <h3>{section.label}</h3>
            <div className="image-manager">
              {existing(section.key).map((img) => (
                <div className="image-tile" key={img}>
                  <img src={getImageUrl(img)} alt={section.label} />
                  <button type="button" className="btn-icon danger" onClick={() => removeExisting(section.key, img)}>
                    <FaTrash />
                  </button>
                </div>
              ))}
              {newFiles[section.key].map((f, i) => (
                <div className="image-tile" key={`new-${i}`}>
                  <img src={URL.createObjectURL(f)} alt="new" />
                  <button
                    type="button"
                    className="btn-icon danger"
                    onClick={() => setNewFiles((prev) => ({ ...prev, [section.key]: prev[section.key].filter((_, idx) => idx !== i) }))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <label className="file-upload-btn">
              <FaPlus /> Add {section.label}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(section.key, e)} />
            </label>
          </div>
        ))}

        <div className="dash-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save About Page"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAbout;
