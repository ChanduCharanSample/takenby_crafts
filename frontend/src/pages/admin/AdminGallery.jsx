import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const AdminGallery = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ caption: "", order: 0, active: true });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const load = () => {
    setLoading(true);
    contentService
      .gallery()
      .then(({ data }) => setItems(data.gallery || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ caption: "", order: items.length, active: true });
    setImageFile(null);
    setPreview("");
    setShowForm(true);
  };

  const openEdit = (g) => {
    setEditing(g);
    setForm({ caption: g.caption || "", order: g.order || 0, active: g.active !== false });
    setImageFile(null);
    setPreview(g.image ? getImageUrl(g.image) : "");
    setShowForm(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !imageFile) {
      showToast("Please choose an image", "error");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(form));
      if (imageFile) fd.append("image", imageFile);
      if (editing) {
        await contentService.updateGalleryItem(editing._id, fd);
        showToast("Gallery item updated", "success");
      } else {
        await contentService.createGalleryItem(fd);
        showToast("Gallery item added", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save gallery item"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery item?")) return;
    try {
      await contentService.deleteGalleryItem(id);
      showToast("Gallery item deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Customer Gallery</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> Add Photo
        </button>
      </div>
      <p className="dash-sub">Customer photos showcased on the homepage.</p>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Gallery Item" : "Add Gallery Photo"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Image {!editing && "*"}</label>
                {preview && <img src={preview} alt="Gallery" className="form-image-preview" />}
                <label className="file-upload-btn">
                  {imageFile ? "Change Image" : "Choose Image"}
                  <input type="file" accept="image/*" hidden onChange={handleImage} />
                </label>
              </div>
              <div className="form-group">
                <label>Caption</label>
                <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="e.g. Custom resin keychain 💕" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gallery-admin-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">📸</p>
            <h3>No gallery photos yet</h3>
          </div>
        ) : (
          items.map((g) => (
            <div className="gallery-admin-card" key={g._id}>
              <img src={getImageUrl(g.image)} alt={g.caption || "Gallery"} />
              <div className="gallery-admin-overlay">
                <span className={`order-status ${g.active ? "status-delivered" : "status-cancelled"}`}>
                  {g.active ? "Active" : "Hidden"}
                </span>
                <div className="table-actions">
                  <button className="btn-icon" onClick={() => openEdit(g)}><FaEdit /></button>
                  <button className="btn-icon danger" onClick={() => handleDelete(g._id)}><FaTrash /></button>
                </div>
              </div>
              {g.caption && <p className="gallery-admin-caption">{g.caption}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
