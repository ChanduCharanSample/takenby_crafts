import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMoneyBillWave } from "react-icons/fa";
import { orderService } from "../../services";
import { getMessage } from "../../services/api";
import { formatPrice, formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const STATUS_OPTIONS = [
  "Order Placed",
  "Confirmed",
  "Preparing",
  "Ready to Ship",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const AdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = (status) => {
    setLoading(true);
    orderService
      .allOrders(status || undefined)
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);
      showToast("Order status updated", "success");
      load(filter);
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  return (
    <div className="dash-content">
      <h1>Manage Orders</h1>
      <p className="dash-sub">View and update the status of all orders.</p>

      <div className="dash-toolbar">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); load(e.target.value); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">🧾</p>
          <h3>No orders found</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link to={`/orders/${o._id}`}>
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                    {o.gift && (o.gift.recipientName || o.gift.message) && (
                      <span className="gift-indicator" title={o.gift.message || o.gift.recipientName}>🎁</span>
                    )}
                  </td>
                  <td>{o.user?.firstName} {o.user?.lastName}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    {o.paymentMethod === "cod" ? "COD" : "UPI"}
                    <span className={`pay-status pay-${o.paymentStatus}`}>
                      {o.paymentStatus}
                    </span>
                    {o.paymentMethod === "upi" && o.payment?.verified === "pending" && (
                      <Link
                        to="/admin/payments"
                        className="verify-link"
                        title="Verify payment"
                      >
                        <FaMoneyBillWave /> Verify
                      </Link>
                    )}
                  </td>
                  <td>
                    {o.status === "Payment Verification Pending" ? (
                      <div>
                        <span className="order-status status-payment-verification-pending">
                          Payment Verification Pending
                        </span>
                        <Link to="/admin/payments" className="btn btn-sm btn-primary verify-btn">
                          Verify Payment
                        </Link>
                      </div>
                    ) : (
                      <select
                        className="status-select"
                        value={o.status}
                        onChange={(e) => handleStatus(o._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
