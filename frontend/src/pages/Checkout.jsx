import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaMobileAlt,
  FaUpload,
  FaCheckCircle,
  FaLock,
  FaGift,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useContent } from "../context/ContentContext";
import { orderService, uploadFile } from "../services";
import { getMessage } from "../services/api";
import { getImageUrl, formatPrice } from "../utils/helpers";
import Spinner from "../components/Spinner";

const Checkout = () => {
  const { cart, count, subtotal, discount, deliveryCharge, total, couponCode, loading } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { settings } = useContent();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [giftName, setGiftName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate("/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  if (loading) return <Spinner />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container section empty-state">
        <p className="empty-emoji">🛒</p>
        <h3>Your cart is empty</h3>
        <p>Add some crafts before checking out.</p>
        <Link to="/shop" className="btn btn-primary">
          Explore Crafts
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshotFile(file);
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const validateAddress = () => {
    if (
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      setError("Please fill your complete delivery address.");
      return false;
    }
    if (!/^[0-9]{6}$/.test(address.pincode)) {
      setError("Pincode must be a 6-digit number.");
      return false;
    }
    return true;
  };

  const placeOrder = async (payload) => {
    setPlacing(true);
    setError("");
    try {
      const { data } = await orderService.create(payload);
      showToast("Order placed successfully! 🎉", "success");
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      setError(getMessage(err, "Could not place order"));
      showToast(getMessage(err, "Could not place order"), "error");
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    setError("");
    setPlacing(true);

    try {
      if (paymentMethod === "upi") {
        if (!screenshotFile) {
          setError("Please upload the UPI payment screenshot.");
          setPlacing(false);
          return;
        }
        const up = await uploadFile(screenshotFile);
        const upiScreenshot = up.data.url;
        await placeOrder({
          shippingAddress: address,
          paymentMethod: "upi",
          payment: { upiScreenshot, upiTransactionId: upiTransactionId.trim() },
          gift: giftName.trim() || giftMessage.trim()
            ? { recipientName: giftName.trim(), message: giftMessage.trim() }
            : undefined,
        });
      } else {
        await placeOrder({
          shippingAddress: address,
          paymentMethod: "cod",
          gift: giftName.trim() || giftMessage.trim()
            ? { recipientName: giftName.trim(), message: giftMessage.trim() }
            : undefined,
        });
      }
    } catch (err) {
      setError(getMessage(err, "Could not place order"));
      setPlacing(false);
    }
  };

  const upiName = settings?.upiName || "TakenBy_Crafts";
  const upiId = settings?.upiId || "";
  const qrCode = settings?.qrCode || "";

  return (
    <div className="container section checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="checkout-card">
            <h3>Delivery Address</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  placeholder="Recipient's full name"
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="form-group full">
                <label>Street / House / Area *</label>
                <input
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  placeholder="123, Craft Colony"
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input name="city" value={address.city} onChange={handleChange} placeholder="City" />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input name="state" value={address.state} onChange={handleChange} placeholder="State" />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  name="pincode"
                  value={address.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          <div className="checkout-card">
            <h3>Gift Message <span className="gift-badge">Optional</span></h3>
            <p className="gift-note">
              <FaGift /> Sending this as a gift? Add a recipient name and a short handwritten note.
            </p>
            <div className="form-grid">
              <div className="form-group full">
                <label>Recipient's Name</label>
                <input
                  type="text"
                  value={giftName}
                  onChange={(e) => setGiftName(e.target.value.slice(0, 100))}
                  placeholder="Who is this gift for?"
                  maxLength="100"
                />
              </div>
              <div className="form-group full">
                <label>Gift Message</label>
                <textarea
                  rows="3"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value.slice(0, 300))}
                  placeholder="Write a short message to include in the box…"
                  maxLength="300"
                />
                <span className="char-count">{giftMessage.length}/300</span>
              </div>
            </div>
          </div>

          <div className="checkout-card">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <button
                className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("cod")}
                type="button"
              >
                <FaMoneyBillWave />
                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Pay when your craft arrives</p>
                </div>
              </button>
              <button
                className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("upi")}
                type="button"
              >
                <FaMobileAlt />
                <div>
                  <strong>UPI Payment</strong>
                  <p>Pay via GPay / PhonePe / Paytm</p>
                </div>
              </button>
            </div>
          </div>

          {paymentMethod === "upi" && (
            <div className="checkout-card upi-card">
              <h3>Pay via UPI</h3>
              <div className="upi-pay-layout">
                <div className="upi-qr-box">
                  {qrCode ? (
                    <img src={getImageUrl(qrCode)} alt="UPI QR Code" className="upi-qr" />
                  ) : (
                    <div className="upi-qr-placeholder">
                      <FaMobileAlt size={40} />
                      <p>Scan & Pay</p>
                    </div>
                  )}
                  <p className="upi-id">
                    {upiName} · <strong>{upiId || "takenbycrafts@upi"}</strong>
                  </p>
                </div>
                <div className="upi-steps">
                  <p className="upi-note">
                    <strong>Steps:</strong>
                  </p>
                  <ol>
                    <li>Scan the QR (or pay to the UPI ID) using any UPI app.</li>
                    <li>Enter the exact order total: <strong>{formatPrice(total)}</strong></li>
                    <li>After payment, upload a screenshot of the confirmation below.</li>
                  </ol>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Upload Payment Screenshot * <span className="req-star">(required)</span>
                </label>
                <div className="file-upload-row">
                  <label className="file-upload-btn">
                    <FaUpload /> {screenshotFile ? "Change Screenshot" : "Choose Screenshot"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshot}
                      hidden
                    />
                  </label>
                  {screenshotPreview && (
                    <img src={screenshotPreview} alt="Screenshot preview" className="screenshot-preview" />
                  )}
                </div>
                {screenshotPreview && (
                  <p className="file-upload-ok">
                    <FaCheckCircle /> Screenshot selected — your payment will be verified by the team.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>UPI Transaction ID (optional)</label>
                <input
                  type="text"
                  value={upiTransactionId}
                  onChange={(e) => setUpiTransactionId(e.target.value)}
                  placeholder="e.g. 410263728190 (helps us verify faster)"
                />
              </div>
              <p className="secure-note">
                <FaLock /> Your order will be confirmed once we verify your payment screenshot.
              </p>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <div className="checkout-card order-items-card">
            <h3>Order Items</h3>
            {cart.items.map((item) => (
              <div className="checkout-item" key={String(item.product._id)}>
                <img
                  src={getImageUrl(item.product.coverImage || item.product.images?.[0])}
                  alt={item.product.name}
                  className="checkout-item-img"
                />
                <div className="checkout-item-info">
                  <Link to={`/product/${item.product._id}`}>
                    {item.product.name}
                  </Link>
                  <span>Qty: {item.quantity}</span>
                </div>
                <div className="checkout-item-price">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-summary">
          <h3>Price Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({count} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {couponCode && (
            <div className="summary-row">
              <span>
                Coupon <strong>{couponCode}</strong>
              </span>
              <span className="discount-value">− {formatPrice(discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery Charge</span>
            <span>{deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? "Placing Order..." : "Place Order"}
          </button>
          {paymentMethod === "upi" && (
            <p className="secure-note">
              <FaLock /> Your payment screenshot is safe with us.
            </p>
          )}
          <Link to="/cart" className="btn btn-outline btn-block">
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
