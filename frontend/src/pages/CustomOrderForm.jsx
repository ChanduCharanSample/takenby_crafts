import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaUpload, FaRupeeSign, FaClipboardCheck } from "react-icons/fa";
import { productService, customizationService } from "../services";
import { getMessage } from "../services/api";
import { getImageUrl, formatPrice, finalPrice } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Spinner from "../components/Spinner";

const CustomOrderForm = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    customText: "",
    color: "",
    size: "",
    theme: "",
    occasion: "",
    specialInstructions: "",
    quantity: 1,
  });
  const [referenceImage, setReferenceImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    productService
      .getProduct(productId)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <Spinner />;

  if (!product) {
    return (
      <div className="container section empty-state">
        <p className="empty-emoji">🎨</p>
        <h3>Product not found</h3>
        <Link to="/custom-orders" className="btn btn-outline">Back to Custom Orders</Link>
      </div>
    );
  }

  if (!product.customizable) {
    return (
      <div className="container section empty-state">
        <p className="empty-emoji">😕</p>
        <h3>This product is not customizable</h3>
        <Link to={`/product/${product._id}`} className="btn btn-outline">Back to Product</Link>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReferenceImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("product", product._id);
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (referenceImage) formData.append("referenceImage", referenceImage);

    try {
      const { data } = await customizationService.create(formData);
      showToast("Customization request submitted! 🎉", "success");
      navigate(`/custom-orders/status/${data.customization._id}`);
    } catch (err) {
      setError(getMessage(err, "Could not submit request"));
      showToast(getMessage(err, "Could not submit request"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section custom-form-page">
      <div className="custom-form-layout">
        <div className="custom-form-product">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            className="custom-form-img"
          />
          <h3>{product.name}</h3>
          <p className="custom-form-category">{product.category?.name}</p>
          <p className="custom-form-price">
            Starting at {formatPrice(finalPrice(product))}
          </p>
          <p className="custom-form-est">
            Estimated: {formatPrice(finalPrice(product) * (form.quantity || 1))}
          </p>
          <div className="custom-form-seller">
            Made to order by TakenBy_Crafts 💛
          </div>
        </div>

        <div className="checkout-card custom-form-card">
          <h3>Design Your {product.name}</h3>
          <p className="modal-sub">
            Tell the artisan what you have in mind. You will confirm the final price once they reply.
          </p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name / Text to add</label>
                <input
                  name="customText"
                  placeholder="e.g. Chandrika"
                  value={form.customText}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Preferred Colour</label>
                <input
                  name="color"
                  placeholder="e.g. Pink, Teal"
                  value={form.color}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Size</label>
                <input
                  name="size"
                  placeholder="e.g. Small / 4 inch"
                  value={form.size}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Theme</label>
                <input
                  name="theme"
                  placeholder="e.g. Floral, Galaxy"
                  value={form.theme}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Occasion</label>
                <select name="occasion" value={form.occasion} onChange={handleChange}>
                  <option value="">Select occasion</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Festival">Festival</option>
                  <option value="Just Because">Just Because</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max="20"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Special Instructions</label>
              <textarea
                name="specialInstructions"
                rows="3"
                placeholder="e.g. Add small gold flakes, matte finish, wrap for gift..."
                value={form.specialInstructions}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Reference Image (optional)</label>
              <label className="file-drop">
                <FaUpload />
                <span>{preview ? "Change image" : "Click to upload a reference photo"}</span>
                <input type="file" accept="image/*" onChange={handleFile} hidden />
              </label>
              {preview && (
                <div className="file-preview">
                  <img src={preview} alt="Reference preview" />
                  <button type="button" onClick={() => { setReferenceImage(null); setPreview(""); }}>
                    Remove
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-terracotta btn-block"
              disabled={submitting}
            >
              <FaClipboardCheck /> {submitting ? "Submitting..." : "Submit Customization Request"}
            </button>
            <p className="secure-note">
              No payment now. We'll share the final price after reviewing your design.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomOrderForm;
