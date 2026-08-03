import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaCopy, FaArchive, FaUndo, FaEye, FaEyeSlash } from "react-icons/fa";
import { productService, categoryService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl, formatPrice, finalPrice } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";
import AdminProductEditor from "./AdminProductEditor";

const AdminProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = (s) => {
    setLoading(true);
    productService
      .adminAll(s || undefined)
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    categoryService
      .adminAll()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const publishToggle = async (p) => {
    try {
      await productService.publish(p._id, !p.isActive);
      load(status);
      showToast(p.isActive ? "Product hidden" : "Product published", "success");
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  const archiveToggle = async (p) => {
    try {
      if (p.isArchived) {
        await productService.restore(p._id);
        showToast("Product restored", "success");
      } else {
        await productService.archive(p._id);
        showToast("Product archived", "info");
      }
      load(status);
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  const duplicate = async (p) => {
    try {
      await productService.duplicate(p._id);
      showToast("Product duplicated (draft)", "success");
      load(status);
    } catch (err) {
      showToast(getMessage(err, "Could not duplicate"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently? This cannot be undone.")) return;
    try {
      await productService.remove(id);
      showToast("Product deleted", "info");
      load(status);
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setEditorOpen(true);
  };

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <div className="dash-page-head">
        <h1>Manage Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> Add Product
        </button>
      </div>
      <p className="dash-sub">Add, edit and organize your handcrafted products.</p>

      <div className="dash-toolbar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            load(e.target.value);
          }}
        >
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Flags</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="table-product">
                    <img src={getImageUrl(p.coverImage || p.images?.[0])} alt={p.name} />
                    <div>
                      <strong>{p.name}</strong>
                      <span className="order-date">{p.category?.name}</span>
                      {p.sku && <span className="order-date">SKU: {p.sku}</span>}
                    </div>
                  </div>
                </td>
                <td>
                  {formatPrice(finalPrice(p))}
                  {p.discount > 0 && (
                    <span className="order-date"><s>{formatPrice(p.price)}</s></span>
                  )}
                </td>
                <td className={p.stock <= p.lowStockThreshold ? "stock-low" : ""}>
                  {p.stock}
                  <span className="order-date">/ {p.lowStockThreshold}</span>
                </td>
                <td>
                  <div className="flag-badges">
                    {p.featured && <span className="flag-badge">⭐ Featured</span>}
                    {p.isBestSeller && <span className="flag-badge">🔥 Best</span>}
                    {p.isNewArrival && <span className="flag-badge">🆕 New</span>}
                    {p.isPersonalized && <span className="flag-badge">🎨 Personalized</span>}
                    {p.customizable && <span className="flag-badge">✏️ Custom</span>}
                  </div>
                </td>
                <td>
                  <span className={`order-status ${p.isArchived ? "status-cancelled" : p.isActive ? "status-delivered" : p.status === "draft" ? "status-pending" : "status-pending"}`}>
                    {p.isArchived ? "Archived" : p.isActive ? "Published" : p.status === "draft" ? "Draft" : "Hidden"}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="btn-icon" title="Duplicate" onClick={() => duplicate(p)}>
                      <FaCopy />
                    </button>
                    <button className="btn-icon" title={p.isArchived ? "Restore" : "Archive"} onClick={() => archiveToggle(p)}>
                      {p.isArchived ? <FaUndo /> : <FaArchive />}
                    </button>
                    {!p.isArchived && (
                      <button className="btn-icon" title={p.isActive ? "Hide" : "Publish"} onClick={() => publishToggle(p)}>
                        {p.isActive ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    )}
                    <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(p._id)}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editorOpen && (
        <AdminProductEditor
          product={editing}
          categories={categories}
          onClose={() => setEditorOpen(false)}
          onSaved={() => load(status)}
        />
      )}
    </div>
  );
};

export default AdminProducts;
