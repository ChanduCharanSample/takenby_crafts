import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import { orderService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl, formatPrice, formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const AdminPayments = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    orderService
      .pendingPayments()
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async (order, approve, notes) => {
    try {
      await orderService.verifyPayment(order._id, approve, notes);
      showToast(
        approve ? "Payment approved, order confirmed" : "Payment rejected, order cancelled",
        approve ? "success" : "info"
      );
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  const handleVerify = (order, approve) => {
    if (!approve && !window.confirm("Reject this payment? The order will be cancelled and stock restored.")) return;
    const notes = window.prompt(approve ? "Optional note for the customer:" : "Reason for rejection:", "");
    if (notes === null) return;
    verify(order, approve, notes);
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <h1>Payment Verification</h1>
      <p className="dash-sub">Verify UPI payment screenshots and confirm orders.</p>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">✅</p>
          <h3>No pending payments</h3>
          <p>All payments have been reviewed. Great job!</p>
          <Link to="/admin/orders" className="btn btn-outline">View All Orders</Link>
        </div>
      ) : (
        <div className="payment-orders">
          {orders.map((o) => (
            <div className="checkout-card payment-order-card" key={o._id}>
              <div className="payment-order-head">
                <div>
                  <Link to={`/orders/${o._id}`}>
                    <strong>Order #{o._id.slice(-8).toUpperCase()}</strong>
                  </Link>
                  <p>
                    {o.user?.firstName} {o.user?.lastName} • {o.user?.phone} • {o.user?.email}
                  </p>
                  <p className="order-date">Placed {formatDate(o.createdAt)}</p>
                </div>
                <div className="payment-order-total">
                  <span>Total</span>
                  <strong>{formatPrice(o.total)}</strong>
                </div>
              </div>

              <div className="payment-order-items">
                {o.items.map((it, i) => (
                  <div className="checkout-item" key={i}>
                    <img src={getImageUrl(it.image)} alt={it.name} className="checkout-item-img" />
                    <div className="checkout-item-info">
                      <span>{it.name}</span>
                      <span>Qty: {it.quantity}</span>
                    </div>
                    <div className="checkout-item-price">{formatPrice(it.price * it.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="payment-screenshot-area">
                {o.payment?.upiScreenshot ? (
                  <a
                    href={getImageUrl(o.payment.upiScreenshot)}
                    target="_blank"
                    rel="noreferrer"
                    className="payment-screenshot-link"
                  >
                    <img
                      src={getImageUrl(o.payment.upiScreenshot)}
                      alt="UPI payment screenshot"
                      className="payment-screenshot-img"
                    />
                  </a>
                ) : (
                  <p className="upi-txn-note">No screenshot uploaded</p>
                )}
                {o.payment?.upiTransactionId && (
                  <span className="upi-txn-note">
                    UPI Txn ID: <strong>{o.payment.upiTransactionId}</strong>
                  </span>
                )}
              </div>

              <div className="payment-order-actions">
                <button className="btn btn-primary" onClick={() => handleVerify(o, true)}>
                  <FaCheck /> Approve Payment
                </button>
                <button className="btn btn-danger" onClick={() => handleVerify(o, false)}>
                  <FaTimes /> Reject Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
