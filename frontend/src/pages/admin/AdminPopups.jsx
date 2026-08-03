import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const DISPLAY_LABELS = {
  "once-session": "Once per session",
  "every-visit": "Every visit",
  daily: "Once per day",
  disabled: "Disabled",
};

const emptyForm = {
  title: "",
  description: "",
  buttonText: "",
  buttonUrl: "",
  display: "once-session",
  enabled: true,
};

const AdminPopups = () => {
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
      .adminPopups()
      .then(({ data }) => setItems(data.popups || []))
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

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || "",
      description: p.description || "",
      buttonText: p.buttonText || "",
      buttonUrl: p.buttonUrl || "",
      display: p.display || "once-session",
      enabled: !!p.enabled,
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
        await contentService.updatePopup(editing._id, fd);
        showToast("Popup updated", "success");
      } else {
        await contentService.createPopup(fd);
        showToast("Popup created", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save popup"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this popup?")) return;
    try {
      await contentService.deletePopup(id);
      showToast("Popup deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  const toggleEnabled = async (p) => {
    try {
      await contentService.updatePopup(p._id, { data: JSON.stringify({ enabled: !p.enabled }) });
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Popup Manager</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> New Popup
        </button>
      </div>
      <p className="dash-sub">Announcement popups shown to visitors. Choose how often each popup appears.</p>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Popup" : "New Popup"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Flat 20% OFF this Diwali!" />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Button Text</label>
                  <input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} placeholder="e.g. Shop Now" />
                </div>
                <div className="form-group">
                  <label>Button URL</label>
                  <input value={form.buttonUrl} onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })} placeholder="/shop" />
                </div>
                <div className="form-group">
                  <label>Display Rule</label>
                  <select value={form.display} onChange={(e) => setForm({ ...form, display: e.target.value })}>
                    <option value="once-session">Once per session</option>
                    <option value="every-visit">Every visit</option>
                    <option value="daily">Once per day</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Image</label>
                  {editing?.image && <img src={getImageUrl(editing.image)} alt="Popup" className="form-image-preview small" />}
                  <label className="file-upload-btn">
                    {imageFile ? "Change Image" : "Upload Image"}
                    <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files[0])} />
                  </label>
                </div>
                <div className="form-group checkbox-grid">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
                    Popup enabled
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

      <div className="table-wrap">
        {items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">🪧</p>
            <h3>No popups yet</h3>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Popup</th>
                <th>Display</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table-product">
                      {p.image && <img src={getImageUrl(p.image)} alt={p.title} />}
                      <div>
                        <strong>{p.title || "(no title)"}</strong>
                        {p.description && <span className="order-date">{p.description.slice(0, 80)}{p.description.length > 80 ? "…" : ""}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{DISPLAY_LABELS[p.display] || p.display}</td>
                  <td>
                    <span className={`order-status ${p.enabled && p.display !== "disabled" ? "status-delivered" : "status-cancelled"}`}>
                      {p.enabled && p.display !== "disabled" ? "Active" : "Off"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => toggleEnabled(p)}>
                        {p.enabled ? "Disable" : "Enable"}
                      </button>
                      <button className="btn-icon" onClick={() => openEdit(p)}><FaEdit /></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(p._id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPopups;
