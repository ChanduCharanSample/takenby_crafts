import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import { customizationService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl, formatPrice, formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const AdminCustomRequests = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [notes, setNotes] = useState({});
  const [prices, setPrices] = useState({});
  const [noteOpen, setNoteOpen] = useState({});

  const load = () => {
    setLoading(true);
    customizationService
      .adminAll()
      .then(({ data }) => setItems(data.customizations || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (c, status, extra = {}) => {
    try {
      await customizationService.updateStatus(c._id, { status, ...extra });
      showToast(`Status updated to ${status}`, "success");
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  const sendFollowUp = async (c, e) => {
    e.preventDefault();
    try {
      await customizationService.updateStatus(c._id, { status: c.status, customMessage: notes[c._id] || "" });
      showToast("Message sent to customer", "success");
      setNotes((n) => ({ ...n, [c._id]: "" }));
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not send message"), "error");
    }
  };

  const setPrice = async (c) => {
    try {
      await customizationService.updateStatus(c._id, { status: c.status, customPrice: Number(prices[c._id]) || 0 });
      showToast("Agreed price updated", "success");
      load();
    } catch (err) {
      showToast(getMessage(err, "Could not update price"), "error");
    }
  };

  const filtered = filter ? items.filter((c) => c.status === filter) : items;

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <h1>Custom Requests</h1>
      <p className="dash-sub">Review and manage personalized order requests.</p>

      <div className="dash-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {["Pending", "Under Review", "Approved", "Rejected", "Awaiting Payment", "In Progress", "Completed", "Cancelled"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">🎨</p>
          <h3>No custom requests yet</h3>
        </div>
      ) : (
        <div className="custom-request-list">
          {filtered.map((c) => (
            <div className="checkout-card custom-request-card" key={c._id}>
              <div className="custom-req-head">
                <div className="custom-req-user">
                  <img
                    src={getImageUrl(c.product?.coverImage || c.product?.images?.[0])}
                    alt={c.product?.name}
                    className="custom-req-img"
                  />
                  <div>
                    <strong>{c.customText || c.product?.name}</strong>
                    <p>
                      {c.user?.firstName} {c.user?.lastName}
                    </p>
                    <p className="order-date">{formatDate(c.createdAt)}</p>
                  </div>
                </div>
                <span className={`order-status status-${c.status.replace(/\s/g, "-").toLowerCase()}`}>
                  {c.status}
                </span>
              </div>

              {c.occasion && <p className="custom-instructions">🎉 Occasion: {c.occasion}</p>}
              {(c.color || c.size || c.theme) && (
                <p className="custom-instructions">
                  {[c.color && `Color: ${c.color}`, c.size && `Size: ${c.size}`, c.theme && `Theme: ${c.theme}`]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}
              {c.specialInstructions && (
                <p className="custom-instructions">"{c.specialInstructions}"</p>
              )}
              {c.referenceImage && (
                <a href={getImageUrl(c.referenceImage)} target="_blank" rel="noreferrer">
                  <img src={getImageUrl(c.referenceImage)} alt="Reference" className="custom-req-img" />
                </a>
              )}
              {c.customPrice > 0 && (
                <p className="custom-price-line">Agreed price: {formatPrice(c.customPrice)}</p>
              )}
              {c.estimatedPrice > 0 && (
                <p className="custom-price-line">Est. price: {formatPrice(c.estimatedPrice)}</p>
              )}
              {c.customMessage && (
                <p className="custom-instructions">Admin note: {c.customMessage}</p>
              )}
              {c.orderId && (
                <Link to={`/orders/${c.orderId}`} className="btn btn-outline btn-sm">
                  View Related Order
                </Link>
              )}

              <div className="custom-req-actions">
                {["Pending", "Under Review"].includes(c.status) && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => updateStatus(c, "Approved")}>
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        const reason = window.prompt("Rejection reason (shown to customer):", "");
                        if (reason === null) return;
                        updateStatus(c, "Rejected", { rejectedReason: reason.trim() });
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                {c.status === "Approved" && (
                  <button className="btn btn-sm btn-primary" onClick={() => updateStatus(c, "In Progress")}>
                    Start Crafting
                  </button>
                )}
                {c.status === "In Progress" && (
                  <button className="btn btn-sm btn-primary" onClick={() => updateStatus(c, "Completed")}>
                    Mark Completed
                  </button>
                )}
                {!["Completed", "Cancelled"].includes(c.status) && (
                  <button className="btn btn-sm btn-outline" onClick={() => updateStatus(c, "Cancelled")}>
                    Cancel
                  </button>
                )}
                <button className="btn btn-sm btn-outline" onClick={() => setNoteOpen((o) => ({ ...o, [c._id]: !o[c._id] }))}>
                  <FaPaperPlane /> Send Message
                </button>
              </div>

              {noteOpen[c._id] && (
                <form className="custom-followup" onSubmit={(e) => sendFollowUp(c, e)}>
                  <div className="custom-price-row">
                    <input
                      type="number"
                      min="0"
                      placeholder="Agreed price (₹)"
                      value={prices[c._id] ?? (c.customPrice || "")}
                      onChange={(e) => setPrices((p) => ({ ...p, [c._id]: e.target.value }))}
                    />
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => setPrice(c)}>
                      Set Price
                    </button>
                  </div>
                  <textarea
                    rows="2"
                    placeholder="Message to customer (price confirmation, design notes, timeline…)"
                    value={notes[c._id] || ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [c._id]: e.target.value }))}
                  />
                  <button type="submit" className="btn btn-sm btn-primary">
                    <FaPaperPlane /> Send to Customer
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomRequests;
