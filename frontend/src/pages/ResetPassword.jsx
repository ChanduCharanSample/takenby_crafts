import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { userService } from "../services";
import { getMessage } from "../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one letter and one number");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await userService.resetPassword({ email, token, password, confirmPassword });
      setDone(true);
    } catch (err) {
      setError(getMessage(err, "Could not reset password"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-head">
            <span className="logo-icon">🔑</span>
            <h1>Invalid Reset Link</h1>
          </div>
          <p className="auth-hint">
            This reset link is missing or malformed. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn btn-primary btn-block">
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <span className="logo-icon">🔑</span>
          <h1>Set a New Password</h1>
          <p>Enter a new password for your account.</p>
        </div>

        {done ? (
          <div className="auth-success">
            <FaCheckCircle className="success-icon" />
            <p>Your password has been updated successfully. You can now login.</p>
            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New Password *</label>
                <div className="input-with-icon">
                  <FaLock />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min 8 chars, letters + numbers"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
