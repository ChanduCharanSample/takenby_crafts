import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaPhone, FaUser, FaPaperPlane, FaRedo, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Register = () => {
  const { registerRequest, registerVerify } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown > 0]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.fullName.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("Mobile number must be 10 digits");
      return false;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError("Password must contain at least one letter and one number");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    const res = await registerRequest(form);
    setSubmitting(false);

    if (res.success) {
      setStep(2);
      setCooldown(60);
      showToast("Verification code sent to your email", "success");
    } else {
      setError(res.message);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setSubmitting(true);
    const res = await registerRequest(form);
    setSubmitting(false);
    if (res.success) {
      setCooldown(60);
      showToast("A new verification code has been sent", "success");
    } else {
      setError(res.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    const res = await registerVerify({ email: form.email.trim(), otp });
    setSubmitting(false);

    if (res.success) {
      showToast("Account created! Welcome to TakenBy_Crafts 🎉", "success");
      navigate("/login");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="auth-head">
          <span className="logo-icon">🎨</span>
          <h1>Create Your TakenBy_Crafts Account</h1>
          <p>{step === 1 ? "Create your account to shop & customise" : "Verify your email to finish"}</p>
        </div>

        {step === 2 && (
          <div className="step-indicator">
            <span className="step done">1</span>
            <span className="step-line"></span>
            <span className="step active">2</span>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequest}>
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-with-icon">
                <FaUser />
                <input
                  name="fullName"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-with-icon">
                <FaEnvelope />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Mobile Number *</label>
              <div className="input-with-icon">
                <FaPhone />
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength="10"
                  required
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password *</label>
              <div className="input-with-icon">
                <FaLock />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Min 8 chars, letters + numbers"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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
            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-with-icon">
                <FaLock />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Sending code..." : (
                <>
                  <FaPaperPlane /> Register
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p className="auth-hint">
              We sent a 6-digit code to <strong>{form.email}</strong>. It expires in 5 minutes.
            </p>
            <div className="form-group">
              <label>Enter OTP</label>
              <div className="input-with-icon">
                <FaLock />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Creating account..." : "Verify & Create Account"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block resend-btn"
              onClick={handleResend}
              disabled={submitting || cooldown > 0}
            >
              <FaRedo /> {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
            >
              Edit details
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
