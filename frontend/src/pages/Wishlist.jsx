import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaCartPlus, FaTrash } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getImageUrl, formatPrice, finalPrice } from "../utils/helpers";
import Spinner from "../components/Spinner";
import RatingStars from "../components/RatingStars";

const Wishlist = () => {
  const { wishlist, count, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!wishlist) return <Spinner />;

  const handleMoveToCart = async (product) => {
    if (product.stock === 0) return;
    const res = await addToCart(product._id, 1);
    if (res.success) {
      await toggleWishlist(product._id);
    }
  };

  return (
    <div className="container section wishlist-page">
      <h1 className="page-title">My Wishlist</h1>

      {count === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">💖</p>
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn btn-primary">
            Discover Crafts
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.items.map((item) => {
            const p = item.product;
            if (!p) return null;
            return (
              <div className="product-card" key={String(p._id)}>
                <Link to={`/product/${p._id}`} className="product-card-link">
                  <div className="product-image-wrap">
                    {p.images?.[0] ? (
                      <img
                        src={getImageUrl(p.images[0])}
                        alt={p.name}
                        loading="lazy"
                        className="product-image"
                      />
                    ) : (
                      <div className="product-image product-image-placeholder">
                        🎨
                      </div>
                    )}
                    {p.discount > 0 && (
                      <span className="discount-tag">-{p.discount}%</span>
                    )}
                    <button
                      className="wishlist-btn active"
                      onClick={() => toggleWishlist(p._id)}
                      aria-label="Remove from wishlist"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="product-info">
                    <p className="product-category">{p.category?.name || "TakenBy_Crafts"}</p>
                    <h3 className="product-name">{p.name}</h3>
                    <div className="product-rating">
                      <RatingStars rating={p.averageRating} count={p.reviewCount} />
                    </div>
                    <div className="product-price-row">
                      <span className="product-price">
                        {formatPrice(finalPrice(p))}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  className={`btn add-cart-btn ${p.stock === 0 ? "disabled" : ""}`}
                  onClick={() => handleMoveToCart(p)}
                  disabled={p.stock === 0}
                >
                  <FaCartPlus /> {p.stock === 0 ? "Out of Stock" : "Move to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
