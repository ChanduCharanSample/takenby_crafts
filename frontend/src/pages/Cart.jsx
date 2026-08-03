import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaTag, FaTimes, FaShoppingBag } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { getImageUrl, formatPrice } from "../utils/helpers";
import Spinner from "../components/Spinner";

const Cart = () => {
  const {
    cart,
    count,
    subtotal,
    discount,
    deliveryCharge,
    total,
    couponCode,
    loading,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");

  if (loading) return <Spinner />;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim());
    if (res.success) setCouponInput("");
  };

  return (
    <div className="container section cart-page">
      <h1 className="page-title">Your Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">🛒</p>
          <h3>Your cart is empty</h3>
          <p>Discover beautiful handmade pieces to fill it with.</p>
          <Link to="/shop" className="btn btn-primary">
            Explore Crafts
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div className="cart-item" key={String(item.product._id)}>
                <Link to={`/product/${item.product._id}`} className="cart-item-img">
                  {item.product.images?.[0] ? (
                    <img
                      src={getImageUrl(item.product.images[0])}
                      alt={item.product.name}
                    />
                  ) : (
                    <span>🎨</span>
                  )}
                </Link>
                <div className="cart-item-info">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="cart-item-name"
                  >
                    {item.product.name}
                  </Link>
                  <p className="cart-item-price">{formatPrice(item.price)} each</p>
                  {item.product.stock <= 3 && (
                    <p className="low-stock">Only {item.product.stock} left</p>
                  )}
                  <div className="cart-item-controls">
                    <div className="qty-selector small">
                      <button
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="coupon-box">
              {couponCode ? (
                <div className="applied-coupon">
                  <span>
                    <FaTag /> {couponCode} applied
                  </span>
                  <button onClick={removeCoupon}>
                    <FaTimes /> Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    placeholder="Enter coupon code (try CRAFT10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-outline btn-sm">
                    Apply
                  </button>
                </form>
              )}
            </div>

            <div className="summary-row">
              <span>Items ({count})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span className="discount-value">− {formatPrice(discount)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charge</span>
              <span>
                {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate("/checkout")}
            >
              <FaShoppingBag /> Proceed to Checkout
            </button>
            <Link to="/shop" className="btn btn-outline btn-block">
              Continue Shopping
            </Link>
            <p className="free-delivery-note">
              🚚 Free delivery on orders above ₹999
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
