import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { couponService } from "../../services";
import { getMessage } from "../../services/api";
import { formatPrice, formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrder: 0,
  maxDiscount: 0,
  expiryDate: "",
  usageLimit: 0,
};

const AdminCoupons = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    couponService
      .getAll()
      .then(({ data }) => setCoupons(data.coupons || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrder: c.minOrder,
      maxDiscount: c.maxDiscount,
      expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : "",
      usageLimit: c.usageLimit,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await couponService.update(editing._id, form);
        showToast("Coupon updated", "success");
      } else {
        await couponService.create(form);
        showToast("Coupon created", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save coupon"), "error");
    }
  };

  const toggleActive = async (c) => {
    try {
      await couponService.update(c._id, { isActive: !c.isActive });
      load();
      showToast(c.isActive ? "Coupon deactivated" : "Coupon activated", "success");
    } catch (err) {
      showToast(getMessage(err), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await couponService.remove(id);
      showToast("Coupon deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Manage Coupons</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Coupon" : "Create Coupon"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CRAFT10"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Usage Limit (0 = unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What is this coupon for?"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Used / Limit</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td><strong>{c.code}</strong></td>
                <td>
                  {c.discountType === "percentage"
                    ? `${c.discountValue}%`
                    : formatPrice(c.discountValue)}
                  {c.maxDiscount > 0 && ` (max ${formatPrice(c.maxDiscount)})`}
                </td>
                <td>{formatPrice(c.minOrder)}</td>
                <td>{c.usedCount} / {c.usageLimit || "∞"}</td>
                <td className={new Date(c.expiryDate) < new Date() ? "stock-zero" : ""}>
                  {formatDate(c.expiryDate)}
                </td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => toggleActive(c)}>
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn-icon" onClick={() => openEdit(c)} title="Edit">
                      <FaEdit />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleDelete(c._id)} title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;
