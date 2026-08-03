import React, { useState } from "react";
import { productService, categoryService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";

const toBoolInput = (v) => v === true || v === "true";

const emptyForm = {
  name: "",
  shortDescription: "",
  description: "",
  category: "",
  sku: "",
  price: "",
  discount: "0",
  stock: "",
  lowStockThreshold: "5",
  materials: "",
  colors: "",
  size: "",
  preparationTime: "3-5 days",
  customizable: false,
  isPersonalized: false,
  featured: false,
  isBestSeller: false,
  isNewArrival: false,
};

const AdminProductEditor = ({ product, categories, onClose, onSaved }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState(
    product
      ? {
          name: product.name || "",
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          category: product.category?._id || product.category || "",
          sku: product.sku || "",
          price: product.price || "",
          discount: product.discount || "0",
          stock: product.stock ?? "",
          lowStockThreshold: product.lowStockThreshold ?? "5",
          materials: product.materials || "",
          colors: product.colors || "",
          size: product.size || "",
          preparationTime: product.preparationTime || "3-5 days",
          customizable: toBoolInput(product.customizable),
          isPersonalized: toBoolInput(product.isPersonalized),
          featured: toBoolInput(product.featured),
          isBestSeller: toBoolInput(product.isBestSeller),
          isNewArrival: toBoolInput(product.isNewArrival),
        }
      : emptyForm
  );
  const [newImages, setNewImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleImages = (e) => {
    setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleDeleteExisting = async (img) => {
    if (!product) return;
    try {
      await productService.deleteImage(product._id, img);
      showToast("Image removed", "info");
      onSaved();
    } catch (err) {
      showToast(getMessage(err, "Could not remove image"), "error");
    }
  };

  const handleSetCover = async (img) => {
    if (!product) return;
    try {
      const images = product.images.filter((i) => i !== img);
      await productService.reorderImages(product._id, [img, ...images], img);
      showToast("Cover image updated", "success");
      onSaved();
    } catch (err) {
      showToast(getMessage(err, "Could not set cover"), "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category || !form.price) {
      showToast("Please fill required fields", "error");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      const payload = { ...form };
      fd.append("data", JSON.stringify(payload));
      newImages.forEach((img) => fd.append("images", img));

      if (product) {
        if (product.images?.length) fd.append("existingImages", JSON.stringify(product.images));
        await productService.update(product._id, fd);
        showToast("Product updated", "success");
      } else {
        await productService.create(fd);
        showToast("Product created", "success");
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(getMessage(err, "Could not save product"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3>{product ? "Edit Product" : "Add New Product"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full">
              <label>Product Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="form-group full">
              <label>Short Description</label>
              <input
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="One-line teaser shown in cards"
              />
            </div>
            <div className="form-group full">
              <label>Full Description *</label>
              <textarea rows="4" value={form.description} onChange={(e) => set("description", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. TBC-RESIN-001" />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input type="number" min="0" max="90" value={form.discount} onChange={(e) => set("discount", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Low Stock Threshold</label>
              <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Materials</label>
              <input value={form.materials} onChange={(e) => set("materials", e.target.value)} placeholder="e.g. Resin, dried flowers" />
            </div>
            <div className="form-group">
              <label>Colors</label>
              <input value={form.colors} onChange={(e) => set("colors", e.target.value)} placeholder="e.g. Rose gold, blush pink" />
            </div>
            <div className="form-group">
              <label>Size / Dimensions</label>
              <input value={form.size} onChange={(e) => set("size", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Preparation Time</label>
              <input value={form.preparationTime} onChange={(e) => set("preparationTime", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Flags</label>
            <div className="checkbox-grid">
              {[
                ["customizable", "Customizable"],
                ["isPersonalized", "Personalized"],
                ["featured", "Featured"],
                ["isBestSeller", "Best Seller"],
                ["isNewArrival", "New Arrival"],
              ].map(([key, label]) => (
                <label className="checkbox-label" key={key}>
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Images ({product?.images?.length || 0} existing + {newImages.length} new)</label>
            <div className="image-manager">
              {product?.images?.map((img, i) => (
                <div className={`image-tile ${product.coverImage === img ? "cover" : ""}`} key={i}>
                  <img src={getImageUrl(img)} alt={`img-${i}`} />
                  <div className="image-tile-actions">
                    {product.coverImage !== img && (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => handleSetCover(img)}>
                        Set Cover
                      </button>
                    )}
                    {product.coverImage === img && <span className="cover-badge">Cover</span>}
                    <button type="button" className="btn-icon danger" onClick={() => handleDeleteExisting(img)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label className="file-upload-btn">
              + Add Images
              <input type="file" accept="image/*" multiple hidden onChange={handleImages} />
            </label>
            {newImages.length > 0 && (
              <div className="image-manager">
                {newImages.map((f, i) => (
                  <div className="image-tile" key={i}>
                    <img src={URL.createObjectURL(f)} alt={`new-${i}`} />
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={() => setNewImages((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : product ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductEditor;
