import React, { useState, useEffect } from "react";
import { FaStar, FaStarHalfAlt, FaTrash } from "react-icons/fa";
import { reviewService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl, formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const AdminReviews = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    reviewService
      .adminAll()
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleFeature = async (r) => {
    try {
      await reviewService.feature(r._id);
      showToast(r.featured ? "Review removed from featured" : "Review featured on homepage", "success");
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await reviewService.remove(id);
      showToast("Review deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  const filtered = filter === "featured" ? reviews.filter((r) => r.featured) : reviews;

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <h1>Manage Reviews</h1>
      <p className="dash-sub">Feature the best reviews to show on the homepage.</p>

      <div className="dash-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Reviews</option>
          <option value="featured">Featured</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">⭐</p>
          <h3>No reviews yet</h3>
        </div>
      ) : (
        <div className="reviews-list">
          {filtered.map((r) => (
            <div className="review-card" key={r._id}>
              <div className="review-head">
                <div className="review-avatar">{r.user?.firstName?.charAt(0) || "U"}</div>
                <div className="review-meta">
                  <strong>{r.user?.firstName} {r.user?.lastName}</strong>
                  <span className="review-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} color={i < r.rating ? "#c9a227" : "#ddd"} size={14} />
                    ))}
                  </span>
                  <span className="order-date">{formatDate(r.createdAt)}</span>
                </div>
                <div className="table-actions">
                  <button
                    className={`btn btn-sm ${r.featured ? "btn-primary" : "btn-outline"}`}
                    onClick={() => toggleFeature(r)}
                  >
                    <FaStar /> {r.featured ? "Featured" : "Feature"}
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(r._id)} title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p className="review-product-name">On: {r.product?.name}</p>
              <p className="review-comment">{r.comment}</p>
              {(r.image || r.images?.length > 0) && (
                <div className="review-images-row">
                  {(r.images?.length ? r.images : [r.image]).map((img, i) => (
                    <img key={i} src={getImageUrl(img)} alt="review" className="review-image" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
