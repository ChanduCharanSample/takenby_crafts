import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { categoryService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const AdminCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", order: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const load = () => {
    setLoading(true);
    categoryService
      .adminAll()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", order: categories.length });
    setImageFile(null);
    setImagePreview("");
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", order: cat.order || 0 });
    setImageFile(null);
    setImagePreview(cat.image ? getImageUrl(cat.image) : "");
    setShowForm(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(form));
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await categoryService.update(editing._id, fd);
        showToast("Category updated", "success");
      } else {
        await categoryService.create(fd);
        showToast("Category created", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not save category"), "error");
    }
  };

  const toggleActive = async (cat) => {
    try {
      await categoryService.update(cat._id, { isActive: !cat.isActive });
      load();
      showToast(cat.isActive ? "Category hidden" : "Category published", "success");
    } catch (err) {
      showToast(getMessage(err), "error");
    }
  };

  const move = async (index, dir) => {
    const arr = [...categories];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    const current = arr[index];
    arr[index] = arr[target];
    arr[target] = current;
    try {
      await categoryService.reorder(arr.map((c) => c._id));
      load();
      showToast("Order updated", "success");
    } catch (err) {
      showToast(getMessage(err, "Reorder failed"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? Products in it will keep their reference.")) return;
    try {
      await categoryService.remove(id);
      showToast("Category deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Manage Categories</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> New Category
        </button>
      </div>
      <p className="dash-sub">Use the arrows to set the order shown on the homepage.</p>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Category" : "Create Category"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Resin Art"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                {imagePreview && (
                  <img src={imagePreview} alt="Category" className="form-image-preview" />
                )}
                <label className="file-upload-btn">
                  {imagePreview ? "Change Image" : "Choose Image"}
                  <input type="file" accept="image/*" hidden onChange={handleImage} />
                </label>
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
              <th>#</th>
              <th>Category</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c._id}>
                <td>
                  <div className="order-btns">
                    <button className="btn-icon" disabled={i === 0} onClick={() => move(i, -1)} title="Move up">
                      <FaArrowUp />
                    </button>
                    <button className="btn-icon" disabled={i === categories.length - 1} onClick={() => move(i, 1)} title="Move down">
                      <FaArrowDown />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="table-product">
                    {c.image ? <img src={getImageUrl(c.image)} alt={c.name} /> : <div className="category-emoji-sm">🎨</div>}
                    <strong>{c.name}</strong>
                  </div>
                </td>
                <td>{c.slug}</td>
                <td>{c.description || "—"}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => toggleActive(c)}>
                    {c.isActive ? "Active" : "Hidden"}
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

export default AdminCategories;
