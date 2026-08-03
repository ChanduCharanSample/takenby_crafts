import React from "react";
import {
  FaShoppingBag,
  FaClipboardCheck,
  FaTools,
  FaBoxOpen,
  FaTruck,
  FaMapMarkerAlt,
  FaHome,
  FaShieldAlt,
  FaCheck,
} from "react-icons/fa";

const STATUS_FLOW = [
  "Order Placed",
  "Confirmed",
  "Preparing",
  "Ready to Ship",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const ICONS = {
  "Order Placed": FaShoppingBag,
  Confirmed: FaClipboardCheck,
  Preparing: FaTools,
  "Ready to Ship": FaBoxOpen,
  Shipped: FaTruck,
  "Out for Delivery": FaMapMarkerAlt,
  Delivered: FaHome,
};

const OrderTimeline = ({ order }) => {
  if (order.status === "Cancelled") {
    return (
      <div className="timeline cancelled-timeline">
        <div className="cancel-icon">✕</div>
        <div>
          <strong>Order Cancelled</strong>
          <p>
            {order.cancellationReason
              ? `Reason: ${order.cancellationReason}`
              : "This order was cancelled."}
          </p>
        </div>
      </div>
    );
  }

  if (order.status === "Payment Verification Pending") {
    return (
      <div className="timeline payment-pending-timeline">
        <div className="timeline-icon verified-icon">
          <FaShieldAlt />
        </div>
        <div>
          <strong>Payment Verification Pending</strong>
          <p>
            We received your payment screenshot. Your order will be confirmed
            once the team verifies your UPI payment — usually within a few hours.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="order-timeline">
      {STATUS_FLOW.map((status, i) => {
        const Icon = ICONS[status];
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div
            key={status}
            className={`timeline-step ${done ? "done" : ""} ${current ? "current" : ""}`}
          >
            <div className="timeline-icon">
              {done ? <FaCheck /> : <Icon />}
            </div>
            <div className="timeline-label">
              <span className="timeline-status">{status}</span>
              {current && order.statusHistory && (
                <span className="timeline-date">
                  {order.statusHistory.length > 0
                    ? new Date(
                        order.statusHistory[order.statusHistory.length - 1].date
                      ).toLocaleString()
                    : ""}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
