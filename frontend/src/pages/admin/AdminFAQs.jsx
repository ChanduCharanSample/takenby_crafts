import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const emptyForm = {
  question: "",
  answer: "",
  category: "general",
  order: 0,
  status: "published",
};

const AdminFAQs = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    contentService
      .adminFaqs()
      .then(({ data }) => setItems(data.faqs || []))
      .catch(() => setItems([]))
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

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category || "general",
      order: f.order || 0,
      status: f.status || "published",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await contentService.updateFaq(editing._id, { data: JSON.stringify(form) });
        showToast("FAQ updated", "success");
      } else {
        await contentService.createFaq({ data: JSON.stringify(form) });
        showToast("FAQ created", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save FAQ"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await contentService.deleteFaq(id);
      showToast("FAQ deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  const toggleStatus = async (f) => {
    const next = f.status === "published" ? "hidden" : "published";
    try {
      await contentService.updateFaq(f._id, { data: JSON.stringify({ status: next }) });
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const arr = [...items];
    const a = arr[index];
    const b = arr[target];
    const aOrder = a.order || 0;
    const bOrder = b.order || 0;
    arr[index] = { ...b, order: aOrder };
    arr[target] = { ...a, order: bOrder };
    setItems(arr);
    try {
      await Promise.all([
        contentService.updateFaq(arr[index]._id, { data: JSON.stringify({ order: arr[index].order }) }),
        contentService.updateFaq(arr[target]._id, { data: JSON.stringify({ order: arr[target].order }) }),
      ]);
    } catch (err) {
      showToast(getMessage(err, "Reorder failed"), "error");
      load();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>FAQ Manager</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> New FAQ
        </button>
      </div>
      <p className="dash-sub">Questions and answers shown on the public FAQ page. Use the arrows to reorder.</p>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit FAQ" : "New FAQ"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Question *</label>
                  <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
                </div>
                <div className="form-group full">
                  <label>Answer *</label>
                  <textarea rows="4" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Shipping, Custom Orders" />
                </div>
                <div className="form-group">
                  <label>Order (lower = first)</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                  </select>
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
            <p className="empty-emoji">❓</p>
            <h3>No FAQs available</h3>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f, i) => (
                <tr key={f._id}>
                  <td>
                    <div className="reorder-btns">
                      <button disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                      <button disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
                    </div>
                  </td>
                  <td>
                    <strong>{f.question}</strong>
                    <div className="order-date">{f.answer.length > 120 ? f.answer.slice(0, 120) + "…" : f.answer}</div>
                  </td>
                  <td>{f.category}</td>
                  <td>
                    <span className={`order-status ${f.status === "published" ? "status-delivered" : "status-cancelled"}`}>
                      {f.status === "published" ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title={f.status === "published" ? "Hide" : "Publish"} onClick={() => toggleStatus(f)}>
                        {f.status === "published" ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button className="btn-icon" onClick={() => openEdit(f)}><FaEdit /></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(f._id)}><FaTrash /></button>
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

export default AdminFAQs;
