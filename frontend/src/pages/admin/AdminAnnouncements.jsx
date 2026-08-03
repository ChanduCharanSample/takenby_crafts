import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaThumbtack } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl, formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const emptyForm = {
  title: "",
  description: "",
  type: "general",
  priority: 0,
  startDate: "",
  endDate: "",
  published: true,
  pinned: false,
  videoLink: "",
  reelLink: "",
};

const AdminAnnouncements = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);

  const load = () => {
    setLoading(true);
    contentService
      .announcements()
      .then(({ data }) => setItems(data.announcements || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description || "",
      type: a.type,
      priority: a.priority || 0,
      startDate: a.startDate ? a.startDate.slice(0, 10) : "",
      endDate: a.endDate ? a.endDate.slice(0, 10) : "",
      published: !!a.published,
      pinned: !!a.pinned,
      videoLink: a.videoLink || "",
      reelLink: a.reelLink || "",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(form));
      if (imageFile) fd.append("image", imageFile);
      if (editing) {
        await contentService.updateAnnouncement(editing._id, fd);
        showToast("Announcement updated", "success");
      } else {
        await contentService.createAnnouncement(fd);
        showToast("Announcement created", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save announcement"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await contentService.deleteAnnouncement(id);
      showToast("Announcement deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Announcements</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> New Announcement
        </button>
      </div>
      <p className="dash-sub">Festival offers, workshop notices and delivery updates shown on the homepage.</p>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Announcement" : "New Announcement"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {["general", "festival", "offer", "workshop", "holiday", "order-delay", "popup-stall", "new-collection", "delivery"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority (higher first)</label>
                  <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date (blank = always)</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Video Link</label>
                  <input value={form.videoLink} onChange={(e) => setForm({ ...form, videoLink: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Reel Link</label>
                  <input value={form.reelLink} onChange={(e) => setForm({ ...form, reelLink: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  {editing?.image && <img src={getImageUrl(editing.image)} alt="Announcement" className="form-image-preview small" />}
                  <label className="file-upload-btn">
                    {imageFile ? "Change Image" : "Upload Image"}
                    <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files[0])} />
                  </label>
                </div>
                <div className="form-group checkbox-grid">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                    Published
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
                    <FaThumbtack /> Pinned
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="announcement-list">
        {items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">📢</p>
            <h3>No announcements yet</h3>
          </div>
        ) : (
          items.map((a) => (
            <div className="checkout-card announcement-card" key={a._id}>
              <div className="announcement-card-head">
                {a.image && <img src={getImageUrl(a.image)} alt={a.title} className="announcement-card-img" />}
                <div>
                  <strong>{a.pinned && <FaThumbtack className="pin-icon" />} {a.title}</strong>
                  <span className="order-date">{a.type} • priority {a.priority}</span>
                  {a.endDate && <span className="order-date">ends {formatDate(a.endDate)}</span>}
                </div>
                <div className="table-actions">
                  <span className={`order-status ${a.published ? "status-delivered" : "status-cancelled"}`}>
                    {a.published ? "Published" : "Draft"}
                  </span>
                  <button className="btn-icon" onClick={() => openEdit(a)}><FaEdit /></button>
                  <button className="btn-icon danger" onClick={() => handleDelete(a._id)}><FaTrash /></button>
                </div>
              </div>
              {a.description && <p className="announcement-card-desc">{a.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
