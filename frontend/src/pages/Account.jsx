import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Account = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
    },
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddress = (e) =>
    setForm({ ...form, address: { ...form.address, [e.target.name]: e.target.value } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setSaving(true);
    const res = await updateUser(form);
    setSaving(false);
    if (res.success) {
      showToast("Profile updated", "success");
      setForm({ ...form, password: "", confirmPassword: "" });
    } else {
      showToast(res.message, "error");
    }
  };

  return (
    <div className="container section account-page">
      <h1 className="page-title">My Account</h1>

      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-avatar">{user?.firstName?.charAt(0)}</div>
          <h3>
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="account-role">
            {user?.role === "admin" ? "👑 Admin" : "🛍️ Customer"}
          </p>
          <nav>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">My Wishlist</Link>
            <Link to="/custom-orders/my">Custom Orders</Link>
            <Link to="/cart">My Cart</Link>
          </nav>
        </aside>

        <div className="account-main">
          <div className="checkout-card">
            <h3>Profile Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <div className="input-with-icon">
                    <FaUser />
                    <input name="firstName" value={form.firstName} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <div className="input-with-icon">
                    <FaUser />
                    <input name="lastName" value={form.lastName} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-with-icon">
                    <FaEnvelope />
                    <input name="email" value={form.email} disabled />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <div className="input-with-icon">
                    <FaPhone />
                    <input name="phone" value={form.phone} onChange={handleChange} maxLength="10" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Street / Area</label>
                  <div className="input-with-icon">
                    <FaMapMarkerAlt />
                    <input name="street" value={form.address.street} onChange={handleAddress} />
                  </div>
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input name="city" value={form.address.city} onChange={handleAddress} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input name="state" value={form.address.state} onChange={handleAddress} />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input name="pincode" value={form.address.pincode} onChange={handleAddress} maxLength="6" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <FaSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
