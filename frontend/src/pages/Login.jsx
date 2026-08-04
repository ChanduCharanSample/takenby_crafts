import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock, FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useContent } from "../context/ContentContext";
import { getImageUrl } from "../utils/helpers";

const Login = () => {
  const { login, adminLogin } = useAuth();
  const { showToast } = useToast();
  const { settings } = useContent();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const logo = settings?.logo || "";

  const [tab, setTab] = useState("customer");

  // Customer state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Admin state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);

  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setLoggingIn(true);
    const res = await login(email.trim(), password);
    setLoggingIn(false);
    if (res.success) {
      showToast(`Welcome back, ${res.user.firstName}!`, "success");
      navigate(from);
    } else {
      setError(res.message);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!adminEmail || !adminPassword) {
      setError("Please enter your email and password");
      return;
    }
    setLoggingIn(true);
    const res = await adminLogin(adminEmail.trim(), adminPassword);
    setLoggingIn(false);
    if (res.success) {
      showToast(`Welcome back, ${res.user.firstName}!`, "success");
      navigate("/admin");
    } else {
      setError(res.message);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setPassword("");
    setAdminPassword("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          {logo ? (
            <img src={getImageUrl(logo)} alt={settings?.websiteName || "Logo"} className="auth-logo" />
          ) : (
            <span className="logo-icon">🎨</span>
          )}
          <h1>Welcome Back to {settings?.websiteName || "TakenBy_Crafts"}</h1>
          <p>Login to continue crafting memories</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${tab === "customer" ? "active" : ""}`}
            onClick={() => switchTab("customer")}
          >
            <FaUserShield /> Customer Login
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === "admin" ? "active" : ""}`}
            onClick={() => switchTab("admin")}
          >
            <FaUserShield /> Admin Login
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {tab === "customer" ? (
          <form onSubmit={handleCustomerLogin}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <FaEnvelope />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <FaLock />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loggingIn}
            >
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>
            <p className="forgot-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <FaEnvelope />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <FaLock />
                <input
                  type={showAdminPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowAdminPass((s) => !s)}
                  aria-label={showAdminPass ? "Hide password" : "Show password"}
                >
                  {showAdminPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loggingIn}
            >
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>
            <p className="forgot-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
          </form>
        )}

        {tab === "customer" && (
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
