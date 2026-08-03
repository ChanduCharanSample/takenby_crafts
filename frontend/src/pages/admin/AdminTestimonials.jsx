import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaStar, FaEye, FaEyeSlash } from "react-icons/fa";
import { contentService, reviewService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const emptyForm = {
  name: "",
  role: "Verified Customer",
  comment: "",
  rating: 5,
  featured: true,
  order: 0,
  status: "published",
};

const AdminTestimonials = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);

  const load = () => {
    setLoading(true);
    contentService
      .adminTestimonials()
      .then(({ data }) => setItems(data.testimonials || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const loadReviews = () => {
    reviewService
      .adminAll()
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => setReviews([]));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPhotoFile(null);
    loadReviews();
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      role: t.role || "Verified Customer",
      comment: t.comment,
      rating: t.rating || 5,
      featured: !!t.featured,
      order: t.order || 0,
      status: t.status || "published",
    });
    setPhotoFile(null);
    setShowForm(true);
  };

  const featureFromReview = (reviewId) => {
    const r = reviews.find((x) => x._id === reviewId);
    if (!r) return;
    setForm({
      ...form,
      name: r.user ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Verified Customer" : "Verified Customer",
      comment: r.comment,
      rating: r.rating || 5,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(form));
      if (photoFile) fd.append("photo", photoFile);
      if (editing) {
        await contentService.updateTestimonial(editing._id, fd);
        showToast("Testimonial updated", "success");
      } else {
        await contentService.createTestimonial(fd);
        showToast("Testimonial created", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save testimonial"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await contentService.deleteTestimonial(id);
      showToast("Testimonial deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  const toggleStatus = async (t) => {
    const next = t.status === "published" ? "hidden" : "published";
    try {
      await contentService.updateTestimonial(t._id, { data: JSON.stringify({ status: next }) });
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Featured Testimonials</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> New Testimonial
        </button>
      </div>
      <p className="dash-sub">Customer testimonials shown on the homepage. Only featured ones appear publicly.</p>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Testimonial" : "New Testimonial"}</h3>
            {!editing && (
              <div className="form-group">
                <label>Feature an existing verified review (optional)</label>
                <select defaultValue="" onChange={(e) => featureFromReview(e.target.value)}>
                  <option value="">— Choose a review to auto-fill —</option>
                  {reviews
                    .filter((r) => r.verified || r.comment)
                    .map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.user ? `${r.user.firstName} ${r.user.lastName || ""}` : "Customer"} • {r.rating}★ • {r.comment.slice(0, 60)}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="form-group full">
                  <label>Review *</label>
                  <textarea rows="3" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Order (lower = first)</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Photo</label>
                  {editing?.photo && <img src={getImageUrl(editing.photo)} alt="Customer" className="form-image-preview small" />}
                  <label className="file-upload-btn">
                    {photoFile ? "Change Photo" : "Upload Photo"}
                    <input type="file" accept="image/*" hidden onChange={(e) => setPhotoFile(e.target.files[0])} />
                  </label>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <div className="form-group checkbox-grid">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    Featured on homepage
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
            <p className="empty-emoji">💬</p>
            <h3>No testimonials available</h3>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Review</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div className="table-product">
                      {t.photo ? <img src={getImageUrl(t.photo)} alt={t.name} /> : <span className="avatar-placeholder">{t.name.charAt(0)}</span>}
                      <div>
                        <strong>{t.name}</strong>
                        <span className="order-date">{t.role}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {t.comment.length > 100 ? t.comment.slice(0, 100) + "…" : t.comment}
                    {t.featured && <span className="flag-badge">⭐ Featured</span>}
                  </td>
                  <td>
                    <span className="testimonial-stars-inline">
                      <FaStar color="#c9a227" /> {t.rating}
                    </span>
                  </td>
                  <td>
                    <span className={`order-status ${t.status === "published" ? "status-delivered" : "status-cancelled"}`}>
                      {t.status === "published" ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title={t.status === "published" ? "Hide" : "Publish"} onClick={() => toggleStatus(t)}>
                        {t.status === "published" ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button className="btn-icon" onClick={() => openEdit(t)}><FaEdit /></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(t._id)}><FaTrash /></button>
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

export default AdminTestimonials;
