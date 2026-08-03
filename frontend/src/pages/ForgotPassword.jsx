import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { userService } from "../services";
import { getMessage } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      await userService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getMessage(err, "Could not send reset link"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <span className="logo-icon">🔑</span>
          <h1>Forgot Password</h1>
          <p>Enter your registered email to receive a password reset link.</p>
        </div>

        {sent ? (
          <div className="auth-success">
            <FaCheckCircle className="success-icon" />
            <p>
              If an account exists for <strong>{email}</strong>, a password
              reset link has been sent to your email. The link is valid for 15
              minutes.
            </p>
            <Link to="/login" className="btn btn-primary btn-block">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
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
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? "Sending..." : (
                  <>
                    <FaPaperPlane /> Send Reset Link
                  </>
                )}
              </button>
            </form>
            <p className="auth-switch">
              Remembered it? <Link to="/login">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
