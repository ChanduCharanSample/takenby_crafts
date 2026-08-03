import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../services";
import { getImageUrl, formatPrice, formatDate } from "../utils/helpers";
import Spinner from "../components/Spinner";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .myOrders()
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="container section orders-page">
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">📦</p>
          <h3>No orders yet</h3>
          <p>When you place an order, you can track it here.</p>
          <Link to="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card-head">
                <div>
                  <p className="order-id">
                    Order <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                  </p>
                  <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <span className={`order-status status-${order.status.replace(/\s/g, "-").toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-card-items">
                {order.items.slice(0, 3).map((item, i) => (
                  <div className="order-item-mini" key={i}>
                    <img src={getImageUrl(item.image)} alt={item.name} />
                    <span className="order-item-name">
                      {item.name} × {item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="more-items">+{order.items.length - 3} more</span>
                )}
              </div>

              <div className="order-card-foot">
                <span className="order-total">{formatPrice(order.total)}</span>
                <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                  View & Track
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
