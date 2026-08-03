import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaCartPlus, FaCheck, FaPalette } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getImageUrl, formatPrice, finalPrice } from "../utils/helpers";
import RatingStars from "./RatingStars";

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const final = finalPrice(product);
  const hasDiscount = product.discount > 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart(product._id, 1);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-link">
        <div className="product-image-wrap">
          {(product.coverImage || (product.images && product.images[0])) ? (
            <img
              src={getImageUrl(product.coverImage || product.images[0])}
              alt={product.name}
              loading="lazy"
              className="product-image"
            />
          ) : (
            <div className="product-image product-image-placeholder">🎨</div>
          )}
          {hasDiscount && (
            <span className="discount-tag">-{product.discount}%</span>
          )}
          {product.customizable && (
            <span className="customizable-tag">
              <FaPalette /> Customizable
            </span>
          )}
          {product.stock === 0 && (
            <span className="out-of-stock-tag">Out of Stock</span>
          )}
          <button
            className={`wishlist-btn ${inWishlist ? "active" : ""}`}
            onClick={toggleWishlist.bind(null, product._id)}
            aria-label="Wishlist"
          >
            <FaHeart />
          </button>
        </div>

        <div className="product-info">
          <p className="product-category">
            {product.category?.name || "TakenBy_Crafts"}
          </p>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-rating">
            <RatingStars rating={product.averageRating} count={product.reviewCount} />
          </div>
          <div className="product-price-row">
            <span className="product-price">{formatPrice(final)}</span>
            {hasDiscount && (
              <span className="product-old-price">{formatPrice(product.price)}</span>
            )}
          </div>
          <p className={`product-stock ${product.stock === 0 ? "out" : ""}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
        </div>
      </Link>

      <button
        className={`btn add-cart-btn ${product.stock === 0 ? "disabled" : ""}`}
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        <FaCartPlus /> {product.stock === 0 ? "Sold Out" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
