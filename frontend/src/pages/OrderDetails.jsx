import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaStar,
  FaRedo,
  FaWhatsapp,
  FaShieldAlt,
  FaFileImage,
} from "react-icons/fa";
import { orderService, reviewService } from "../services";
import { getMessage } from "../services/api";
import { getImageUrl, formatPrice, formatDate } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useContent } from "../context/ContentContext";
import Spinner from "../components/Spinner";
import OrderTimeline from "../components/OrderTimeline";

const ReviewModal = ({ item, onClose, onSubmitted }) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast("Please write a short review", "error");
      return;
    }
    const formData = new FormData();
    formData.append("product", item.product);
    formData.append("order", window.orderId);
    formData.append("rating", rating);
    formData.append("comment", comment.trim());
    if (image) formData.append("image", image);

    setSubmitting(true);
    try {
      await reviewService.create(formData);
      showToast("Review submitted! Thank you 💛", "success");
      onSubmitted();
      onClose();
    } catch (err) {
      showToast(getMessage(err, "Could not submit review"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Review this product</h3>
        <p className="modal-sub">You purchased: {item.name}</p>
        <form onSubmit={handleSubmit}>
          <div className="star-input">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                type="button"
                key={s}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
              >
                <FaStar
                  color={(hover || rating) >= s ? "#c9a227" : "#ddd"}
                  size={28}
                />
              </button>
            ))}
          </div>
          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              rows="4"
              placeholder="How was the quality, packaging, delivery?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { settings, contact } = useContent();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviews, setReviews] = useState({});

  const loadOrder = () => {
    setLoading(true);
    orderService
      .getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (order && user) {
      const map = {};
      order.items.forEach((item) => {
        reviewService
          .productReviews(item.product)
          .then(({ data }) => {
            const mine = data.reviews.find(
              (r) => String(r.user?._id) === String(user._id)
            );
            if (mine) map[item.product] = mine;
          })
          .catch(() => {});
      });
      setTimeout(() => setReviews({ ...map }), 400);
    }
  }, [order, user]);

  if (loading) return <Spinner />;

  if (!order) {
    return (
      <div className="container section empty-state">
        <p className="empty-emoji">📦</p>
        <h3>Order not found</h3>
        <Link to="/orders" className="btn btn-outline">Back to Orders</Link>
      </div>
    );
  }

  const canCancel = ["Order Placed", "Confirmed", "Preparing"].includes(order.status);
  const canReview = order.status === "Delivered";
  const isPendingVerification = order.status === "Payment Verification Pending";

  const buildWhatsAppLink = () => {
    const raw = settings?.whatsapp || contact?.whatsapp || "919876543210";
    const number = String(raw).replace(/\D/g, "");
    const items = order.items
      .map((i) => `• ${i.name} ×${i.quantity}`)
      .join("\n");
    const message = [
      `Hello ${settings?.websiteName || "TakenBy_Crafts"}! 👋`,
      `I have a query about my order #${order._id.slice(-8).toUpperCase()}.`,
      "",
      "Order Summary:",
      items,
      "",
      `Total: ${formatPrice(order.total)}`,
      `Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI"}`,
    ].join("\n");
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const handleCancel = async () => {
    try {
      await orderService.cancel(id, cancelReason);
      showToast("Order cancelled", "info");
      setShowCancel(false);
      loadOrder();
    } catch (err) {
      showToast(getMessage(err, "Could not cancel order"), "error");
    }
  };

  const handleReorder = async () => {
    try {
      await orderService.reorder(id);
      showToast("Items added back to your cart", "success");
    } catch (err) {
      showToast(getMessage(err, "Could not reorder"), "error");
    }
  };

  window.orderId = order._id;

  return (
    <div className="container section order-details-page">
      <div className="order-details-head">
        <div>
          <Link to="/orders" className="breadcrumb-link">← My Orders</Link>
          <h1 className="page-title">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p>Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="order-details-actions">
          {canCancel && (
            <button className="btn btn-outline btn-sm" onClick={() => setShowCancel(true)}>
              Cancel Order
            </button>
          )}
          <button className="btn btn-outline btn-sm" onClick={handleReorder}>
            <FaRedo /> Reorder
          </button>
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp btn-sm"
          >
            <FaWhatsapp /> Contact on WhatsApp
          </a>
        </div>
      </div>

      {isPendingVerification && (
        <div className="payment-verification-banner">
          <FaShieldAlt />
          <div>
            <strong>Payment verification in progress</strong>
            <p>
              We've received your UPI screenshot. The team will verify your payment
              and confirm your order shortly. You can message us on WhatsApp for faster support.
            </p>
          </div>
        </div>
      )}

      <div className="order-status-card">
        <h3>Track Order</h3>
        <OrderTimeline order={order} />
      </div>

      {showCancel && (
        <div className="modal-overlay" onClick={() => setShowCancel(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel this order?</h3>
            <div className="form-group">
              <label>Reason (optional)</label>
              <textarea
                rows="3"
                placeholder="Tell us why you are cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowCancel(false)}>
                Keep Order
              </button>
              <button className="btn btn-danger" onClick={handleCancel}>
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewingItem && (
        <ReviewModal
          item={reviewingItem}
          orderId={order._id}
          onClose={() => setReviewingItem(null)}
          onSubmitted={loadOrder}
        />
      )}

      <div className="checkout-layout order-details-layout">
        <div className="checkout-main">
          <div className="checkout-card">
            <h3>Items</h3>
            {order.items.map((item, i) => (
              <div className="checkout-item" key={i}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="checkout-item-img"
                />
                <div className="checkout-item-info">
                  <Link to={`/product/${item.product}`}>{item.name}</Link>
                  <span>Qty: {item.quantity}</span>
                  {item.customOrderId && (
                    <span className="custom-order-tag">🎨 Custom Order</span>
                  )}
                </div>
                <div className="checkout-item-actions">
                  <div className="checkout-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                  {canReview && (
                    reviews[item.product] ? (
                      <span className="reviewed-tag">✓ Reviewed</span>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setReviewingItem(item)}
                      >
                        <FaStar /> Write Review
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {order.paymentMethod === "upi" && order.payment?.upiScreenshot && (
            <div className="checkout-card">
              <h3>Payment Screenshot</h3>
              <a
                href={getImageUrl(order.payment.upiScreenshot)}
                target="_blank"
                rel="noreferrer"
                className="screenshot-link"
              >
                <FaFileImage /> View uploaded payment screenshot
              </a>
              {order.payment.upiTransactionId && (
                <p className="upi-txn-note">
                  UPI Transaction ID: <strong>{order.payment.upiTransactionId}</strong>
                </p>
              )}
            </div>
          )}

          {order.gift && (order.gift.recipientName || order.gift.message) && (
            <div className="checkout-card gift-card">
              <h3>🎁 Gift Message</h3>
              {order.gift.recipientName && (
                <p>
                  <strong>For:</strong> {order.gift.recipientName}
                </p>
              )}
              {order.gift.message && <p className="gift-message-text">"{order.gift.message}"</p>}
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.couponCode && (
            <div className="summary-row">
              <span>Coupon {order.couponCode}</span>
              <span className="discount-value">− {formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery</span>
            <span>{order.deliveryCharge === 0 ? "FREE" : formatPrice(order.deliveryCharge)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>

          <div className="payment-details">
            <p>
              <strong>Payment:</strong>{" "}
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI"}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span className={`pay-status pay-${order.paymentStatus}`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </p>
            {order.payment?.verified && order.payment.verified !== "pending" && (
              <p>
                <strong>Verification:</strong>{" "}
                <span className={`pay-status pay-${order.payment.verified === "approved" ? "paid" : "failed"}`}>
                  {order.payment.verified === "approved" ? "Approved ✓" : "Rejected ✕"}
                </span>
              </p>
            )}
            {order.payment?.rejectedReason && (
              <p className="rejected-note">
                Reason: {order.payment.rejectedReason}
              </p>
            )}
          </div>

          <div className="shipping-address">
            <h4>Delivering to</h4>
            {order.shippingAddress.fullName && (
              <p>{order.shippingAddress.fullName}</p>
            )}
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
            {order.shippingAddress.phone && <p>📞 {order.shippingAddress.phone}</p>}
          </div>

          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp btn-block"
          >
            <FaWhatsapp /> Chat about this order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
