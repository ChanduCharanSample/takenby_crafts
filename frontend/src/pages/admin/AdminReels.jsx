import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaInstagram } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const emptyForm = {
  url: "",
  title: "",
  description: "",
  thumbnail: "",
  featured: false,
  order: 0,
  active: true,
};

const AdminReels = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbFile, setThumbFile] = useState(null);

  const load = () => {
    setLoading(true);
    contentService
      .reels()
      .then(({ data }) => setItems(data.reels || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: items.length });
    setThumbFile(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      url: r.url,
      title: r.title || "",
      description: r.description || "",
      thumbnail: r.thumbnail || "",
      featured: !!r.featured,
      order: r.order || 0,
      active: r.active !== false,
    });
    setThumbFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(form));
      if (thumbFile) fd.append("thumbnail", thumbFile);
      if (editing) {
        await contentService.updateReel(editing._id, fd);
        showToast("Reel updated", "success");
      } else {
        await contentService.createReel(fd);
        showToast("Reel added", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save reel"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reel?")) return;
    try {
      await contentService.deleteReel(id);
      showToast("Reel deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Instagram Reels</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> Add Reel
        </button>
      </div>
      <p className="dash-sub">Embed your Instagram reels on the homepage.</p>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Reel" : "Add Reel"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Instagram Reel URL *</label>
                  <input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://www.instagram.com/reel/XXXXXXX/"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Thumbnail</label>
                  {(thumbFile || form.thumbnail) && (
                    <img
                      src={thumbFile ? URL.createObjectURL(thumbFile) : getImageUrl(form.thumbnail)}
                      alt="Thumbnail"
                      className="form-image-preview small"
                    />
                  )}
                  <label className="file-upload-btn">
                    {thumbFile ? "Change Thumbnail" : "Upload Thumbnail"}
                    <input type="file" accept="image/*" hidden onChange={(e) => setThumbFile(e.target.files[0])} />
                  </label>
                </div>
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                </div>
                <div className="form-group checkbox-grid">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    Active
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    Featured
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Update" : "Add Reel"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="reels-admin-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">🎬</p>
            <h3>No reels yet</h3>
          </div>
        ) : (
          items.map((r) => (
            <div className="checkout-card reel-admin-card" key={r._id}>
              {r.thumbnail ? (
                <img src={getImageUrl(r.thumbnail)} alt={r.title || "reel"} className="reel-admin-thumb" />
              ) : (
                <div className="reel-admin-icon"><FaInstagram /></div>
              )}
              <div>
                <strong>{r.title || "Untitled reel"}</strong>
                <p className="order-date">{r.url}</p>
                <p className="order-date">Order {r.order} • {r.active ? "Active" : "Hidden"} {r.featured ? "• Featured" : ""}</p>
              </div>
              <div className="table-actions">
                <button className="btn-icon" onClick={() => openEdit(r)}><FaEdit /></button>
                <button className="btn-icon danger" onClick={() => handleDelete(r._id)}><FaTrash /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReels;
