import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaCheck,
  FaCartPlus,
  FaPalette,
  FaTruck,
  FaShieldAlt,
  FaBoxOpen,
  FaWhatsapp,
  FaLink,
  FaShareAlt,
} from "react-icons/fa";
import { productService, reviewService } from "../services";
import { getImageUrl, formatPrice, finalPrice, formatDate } from "../utils/helpers";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useContent } from "../context/ContentContext";
import RatingStars from "../components/RatingStars";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { settings } = useContent();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    productService
      .getProduct(id)
      .then(({ data }) => {
        setProduct(data.product);
        setReviews(data.reviews || []);
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => setLoading(false));
    productService
      .getRelated(id)
      .then(({ data }) => setRelated(data.products || []))
      .catch(() => setRelated([]));
  }, [id]);

  if (loading) return <Spinner />;

  if (!product) {
    return (
      <div className="container section empty-state">
        <p className="empty-emoji">🔍</p>
        <h3>Product not found</h3>
        <Link to="/shop" className="btn btn-outline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const final = finalPrice(product);
  const inWishlist = isInWishlist(product._id);
  const images = product.images && product.images.length ? product.images : [""];

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const res = await addToCart(product._id, quantity);
    if (res.success) setQuantity(1);
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const res = await addToCart(product._id, quantity);
    if (res.success) navigate("/checkout");
  };

  const shareUrl = window.location.href;
  const shareText = `${product.name} — ${formatPrice(final)} | ${settings?.websiteName || "TakenBy_Crafts"}`;

  const handleWhatsAppShare = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      "_blank",
      "noopener"
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Product link copied to clipboard", "success");
    } catch (err) {
      showToast("Could not copy link", "error");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: shareText, url: shareUrl });
      } catch (err) {
        /* user cancelled */
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="container section product-details-page">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> /{" "}
        <Link to="/shop">Shop</Link> /{" "}
        <Link to={`/category/${product.category?.slug || ""}`}>
          {product.category?.name || "Category"}
        </Link>{" "}
        / <span>{product.name}</span>
      </nav>

      <div className="product-details-layout">
        <div className="product-gallery">
          <div className="gallery-main">
            <img
              src={getImageUrl(images[activeImage])}
              alt={product.name}
              className="gallery-main-img"
            />
            {product.discount > 0 && (
              <span className="discount-tag big">-{product.discount}%</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`thumb ${i === activeImage ? "active" : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={getImageUrl(img)} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-details-info">
          <p className="product-category">
            {product.category?.name}
            {product.customizable && (
              <span className="customizable-badge">
                <FaPalette /> Customizable
              </span>
            )}
          </p>
          <h1 className="details-title">{product.name}</h1>

          <div className="details-rating">
            <RatingStars rating={product.averageRating} count={product.reviewCount} size={18} />
            <span className="reviews-link">({reviews.length} reviews)</span>
          </div>

          <div className="details-price-row">
            <span className="details-price">{formatPrice(final)}</span>
            {product.discount > 0 && (
              <>
                <span className="details-old-price">{formatPrice(product.price)}</span>
                <span className="save-tag">Save {formatPrice(product.price - final)}</span>
              </>
            )}
          </div>

          <p className="details-tax">Inclusive of all taxes. Handmade to order.</p>

          <p className="details-stock">
            {product.stock > 0 ? (
              <>
                <FaCheck className="stock-check" /> In Stock — {product.stock} available
              </>
            ) : (
              <span className="out">Out of stock</span>
            )}
          </p>

          <div className="details-description">
            <h4>About this piece</h4>
            <p>{product.description}</p>
          </div>

          <div className="details-specs">
            {product.materials && (
              <div className="spec">
                <span className="spec-label">Materials</span>
                <span className="spec-value">{product.materials}</span>
              </div>
            )}
            {product.size && (
              <div className="spec">
                <span className="spec-label">Size</span>
                <span className="spec-value">{product.size}</span>
              </div>
            )}
            <div className="spec">
              <span className="spec-label">Preparation Time</span>
              <span className="spec-value">{product.preparationTime}</span>
            </div>
          </div>

          {product.stock > 0 && (
            <div className="details-actions">
              <div className="qty-selector">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button className="btn btn-primary" onClick={handleAddToCart}>
                <FaCartPlus /> Add to Cart
              </button>
              <button className="btn btn-dark" onClick={handleBuyNow}>
                Buy Now
              </button>
              <button
                className={`btn wishlist-btn-lg ${inWishlist ? "active" : ""}`}
                onClick={() => toggleWishlist(product._id)}
              >
                <FaHeart /> {inWishlist ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
          )}

          {product.customizable && (
            <Link
              to={`/custom-orders/new/${product._id}`}
              className="btn btn-terracotta custom-cta"
            >
              <FaPalette /> Make This Custom
            </Link>
          )}

          <div className="details-trust">
            <div><FaTruck /> Dispatched in {product.preparationTime}</div>
            <div><FaShieldAlt /> Secure COD & Online Payment</div>
            <div><FaBoxOpen /> Gift-ready packaging</div>
          </div>

          <div className="share-section">
            <span className="share-label">Share this craft:</span>
            <button className="share-btn whatsapp" onClick={handleWhatsAppShare} title="Share on WhatsApp">
              <FaWhatsapp />
            </button>
            <button className="share-btn link" onClick={handleCopyLink} title="Copy link">
              <FaLink />
            </button>
            {navigator.share ? (
              <button className="share-btn native" onClick={handleNativeShare} title="Share">
                <FaShareAlt />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="details-reviews">
        <h3>Customer Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="empty-text">
            No reviews yet. Be the first to review after your order arrives.
          </p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div className="review-card" key={r._id}>
                <div className="review-head">
                  <div className="review-avatar">
                    {r.user?.firstName?.charAt(0) || "U"}
                  </div>
                  <div className="review-meta">
                    <strong>
                      {r.user?.firstName} {r.user?.lastName}
                    </strong>
                    {r.verified && <span className="verified-badge">✓ Verified Purchase</span>}
                    <RatingStars rating={r.rating} size={13} />
                  </div>
                  <span className="review-date">{formatDate(r.createdAt)}</span>
                </div>
                <p className="review-comment">{r.comment}</p>
                {r.image && (
                  <img
                    src={getImageUrl(r.image)}
                    alt="review"
                    className="review-image"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="details-related">
          <h3>You May Also Like</h3>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
