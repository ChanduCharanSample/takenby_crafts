import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { customizationService } from "../services";
import { getImageUrl, formatPrice, formatDate } from "../utils/helpers";
import Spinner from "../components/Spinner";

const MyCustomOrders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customizationService
      .my()
      .then(({ data }) => setItems(data.customizations || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="container section">
      <h1 className="page-title">My Custom Orders</h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">🎨</p>
          <h3>No custom orders yet</h3>
          <p>Request a personalized handmade creation and track it here.</p>
          <Link to="/custom-orders" className="btn btn-primary">
            Start a Custom Order
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {items.map((c) => (
            <div className="order-card" key={c._id}>
              <div className="order-card-head">
                <div>
                  <p className="order-id">
                    Request <strong>#{c._id.slice(-8).toUpperCase()}</strong>
                  </p>
                  <p className="order-date">
                    {c.product?.name} • Submitted {formatDate(c.createdAt)}
                  </p>
                </div>
                <span className={`order-status status-${c.status.replace(/\s/g, "-").toLowerCase()}`}>
                  {c.status}
                </span>
              </div>
              {c.customText && (
                <p className="custom-request-text">🖊️ "{c.customText}"</p>
              )}
              {c.customMessage && (
                <p className="seller-message">💬 TakenBy_Crafts: {c.customMessage}</p>
              )}
              <div className="order-card-foot">
                <span className="order-total">
                  {c.customPrice > 0
                    ? `Final price: ${formatPrice(c.customPrice)}`
                    : `Estimated: ${formatPrice(c.estimatedPrice)}`}
                </span>
                <Link to={`/custom-orders/status/${c._id}`} className="btn btn-outline btn-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCustomOrders;
