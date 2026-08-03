import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl, formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const emptyForm = {
  name: "",
  description: "",
  offerText: "",
  couponCode: "",
  buttonText: "Shop Now",
  buttonUrl: "",
  startDate: "",
  endDate: "",
  enabled: true,
};

const STATUS_BADGE = {
  active: "status-delivered",
  scheduled: "status-pending",
  draft: "status-cancelled",
  expired: "status-cancelled",
};

const AdminFestivalCampaigns = () => {
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
      .adminCampaigns()
      .then(({ data }) => setItems(data.campaigns || []))
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

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || "",
      offerText: c.offerText || "",
      couponCode: c.couponCode || "",
      buttonText: c.buttonText || "Shop Now",
      buttonUrl: c.buttonUrl || "",
      startDate: c.startDate ? c.startDate.slice(0, 10) : "",
      endDate: c.endDate ? c.endDate.slice(0, 10) : "",
      enabled: !!c.enabled,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(form));
      if (imageFile) fd.append("banner", imageFile);
      if (editing) {
        await contentService.updateCampaign(editing._id, fd);
        showToast("Campaign updated", "success");
      } else {
        await contentService.createCampaign(fd);
        showToast("Campaign created", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save campaign"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    try {
      await contentService.deleteCampaign(id);
      showToast("Campaign deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  const toggleEnabled = async (c) => {
    try {
      await contentService.updateCampaign(c._id, { data: JSON.stringify({ enabled: !c.enabled }) });
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Festival & Offer Campaigns</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> New Campaign
        </button>
      </div>
      <p className="dash-sub">Festival offers with banner, offer text, coupon and button. Campaigns auto-publish on the start date and auto-expire on the end date.</p>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Campaign" : "New Campaign"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Campaign Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Diwali Special 2026" />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group full">
                  <label>Offer Text</label>
                  <input value={form.offerText} onChange={(e) => setForm({ ...form, offerText: e.target.value })} placeholder="e.g. Flat 20% OFF on all hampers" />
                </div>
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} placeholder="e.g. DIWALI20" />
                </div>
                <div className="form-group">
                  <label>Button Text</label>
                  <input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
                </div>
                <div className="form-group full">
                  <label>Button URL</label>
                  <input value={form.buttonUrl} onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })} placeholder="/shop" />
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
                  <label>Banner</label>
                  {editing?.banner && <img src={getImageUrl(editing.banner)} alt="Banner" className="form-image-preview small" />}
                  <label className="file-upload-btn">
                    {imageFile ? "Change Banner" : "Upload Banner"}
                    <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files[0])} />
                  </label>
                </div>
                <div className="form-group checkbox-grid">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
                    Campaign enabled
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
            <p className="empty-emoji">🎉</p>
            <h3>No active festival campaigns</h3>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Dates</th>
                <th>Offer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="table-product">
                      {c.banner && <img src={getImageUrl(c.banner)} alt={c.name} />}
                      <div>
                        <strong>{c.name}</strong>
                        {c.couponCode && <span className="order-date">Coupon: {c.couponCode}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    {formatDate(c.startDate)}
                    <span className="order-date">→ {c.endDate ? formatDate(c.endDate) : "Always"}</span>
                  </td>
                  <td>{c.offerText || "—"}</td>
                  <td>
                    <span className={`order-status ${STATUS_BADGE[c.derivedStatus] || "status-pending"}`}>
                      {c.derivedStatus}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => toggleEnabled(c)}>
                        {c.enabled ? "Disable" : "Enable"}
                      </button>
                      <button className="btn-icon" onClick={() => openEdit(c)}><FaEdit /></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(c._id)}><FaTrash /></button>
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

export default AdminFestivalCampaigns;
