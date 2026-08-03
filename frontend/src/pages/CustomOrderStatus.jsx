import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaRupeeSign, FaPalette, FaBoxOpen } from "react-icons/fa";
import { customizationService, orderService } from "../services";
import { getMessage } from "../services/api";
import { getImageUrl, formatPrice } from "../utils/helpers";
import { useToast } from "../context/ToastContext";
import Spinner from "../components/Spinner";

const CustomOrderStatus = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    customizationService
      .getById(id)
      .then(({ data }) => setItem(data.customization))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Spinner />;

  if (!item) {
    return (
      <div className="container section empty-state">
        <p className="empty-emoji">🎨</p>
        <h3>Customization not found</h3>
        <Link to="/custom-orders/my" className="btn btn-outline">Back</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!item.product) return;
    setError("");
    try {
      const { data } = await orderService.create({
        shippingAddress: {
          street: item.user?.address?.street || "",
          city: item.user?.address?.city || "",
          state: item.user?.address?.state || "",
          pincode: item.user?.address?.pincode || "",
        },
        paymentMethod: "cod",
        customItems: [{ customizationId: item._id }],
      });
      await customizationService.updateStatus(item._id, {
        status: "Awaiting Payment",
        customPrice: item.customPrice,
      });
      showToast("Order placed for your custom piece! 🎉", "success");
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      setError(getMessage(err, "Could not place order"));
      showToast(getMessage(err, "Could not place order"), "error");
    }
  };

  return (
    <div className="container section custom-status-page">
      <div className="order-status-card">
        <div className="custom-status-head">
          <span className="logo-icon">🎨</span>
          <h1>Customization Status</h1>
          <p>Request #{item._id.slice(-8).toUpperCase()}</p>
          <span className={`order-status status-${item.status.replace(/\s/g, "-").toLowerCase()}`}>
            {item.status}
          </span>
        </div>
        <p className="custom-status-desc">
          {item.status === "Pending" && "Your request is waiting to be reviewed by TakenBy_Crafts."}
          {item.status === "Under Review" && "We're now reviewing your design details. Hang tight!"}
          {item.status === "Approved" && "Great news! Your design is approved. Review the final price and confirm to proceed."}
          {item.status === "Rejected" && item.rejectedReason && `This request was not accepted. Reason: ${item.rejectedReason}`}
          {item.status === "Rejected" && !item.rejectedReason && "This request was not accepted."}
          {item.status === "Awaiting Payment" && "Order placed. Complete the payment to start crafting."}
          {item.status === "In Progress" && "Your piece is being crafted with love. Stay tuned!"}
          {item.status === "Completed" && "Your custom piece is complete and on its way to you!"}
          {item.status === "Cancelled" && "This customization request was cancelled."}
        </p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="checkout-card">
            <h3>Your Design</h3>
            <div className="custom-design-details">
              <div className="checkout-item">
                <img
                  src={getImageUrl(item.product?.images?.[0])}
                  alt={item.product?.name}
                  className="checkout-item-img"
                />
                <div className="checkout-item-info">
                  <Link to={`/product/${item.product?._id}`}>{item.product?.name}</Link>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>

              <div className="design-fields">
                {item.customText && (
                  <div className="design-field">
                    <span>Name / Text</span>
                    <strong>{item.customText}</strong>
                  </div>
                )}
                {item.color && (
                  <div className="design-field">
                    <span>Colour</span>
                    <strong>{item.color}</strong>
                  </div>
                )}
                {item.size && (
                  <div className="design-field">
                    <span>Size</span>
                    <strong>{item.size}</strong>
                  </div>
                )}
                {item.theme && (
                  <div className="design-field">
                    <span>Theme</span>
                    <strong>{item.theme}</strong>
                  </div>
                )}
                {item.occasion && (
                  <div className="design-field">
                    <span>Occasion</span>
                    <strong>{item.occasion}</strong>
                  </div>
                )}
                {item.specialInstructions && (
                  <div className="design-field">
                    <span>Special Instructions</span>
                    <strong>{item.specialInstructions}</strong>
                  </div>
                )}
              </div>

              {item.referenceImage && (
                <div className="reference-image">
                  <span>Reference Image</span>
                  <img src={getImageUrl(item.referenceImage)} alt="Reference" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="checkout-summary">
          <h3>Price & Next Step</h3>
          <div className="summary-row">
            <span>Estimated Price</span>
            <span>{formatPrice(item.estimatedPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Final Price (agreed)</span>
            <span className="discount-value">
              {item.customPrice > 0 ? formatPrice(item.customPrice) : "Pending"}
            </span>
          </div>

          {item.customMessage && (
            <div className="seller-note">
              <strong>Message from TakenBy_Crafts:</strong>
              <p>{item.customMessage}</p>
            </div>
          )}

          <div className="summary-row total">
            <span>Amount to Pay</span>
            <span>
              {item.customPrice > 0 ? formatPrice(item.customPrice) : "—"}
            </span>
          </div>

          {item.status === "Approved" && item.customPrice > 0 && (
            <button className="btn btn-primary btn-block" onClick={handlePlaceOrder}>
              <FaBoxOpen /> Confirm & Place Order
            </button>
          )}

          {item.status === "Rejected" && (
            <p className="form-error">
              You can <Link to={`/custom-orders/new/${item.product?._id}`}>try another request</Link> for this product.
            </p>
          )}

          {error && <div className="form-error">{error}</div>}

          {!["In Progress", "Completed", "Cancelled"].includes(item.status) &&
            item.status !== "Approved" && (
              <Link to="/custom-orders/my" className="btn btn-outline btn-block">
                Back to My Custom Orders
              </Link>
            )}
        </div>
      </div>
    </div>
  );
};

export default CustomOrderStatus;
