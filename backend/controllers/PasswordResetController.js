const crypto = require("crypto");
const User = require("../models/users");
const PasswordResetToken = require("../models/passwordreset");
const { generateToken, publicUser } = require("./AuthController");
const { validatePassword } = require("../utils/passwordPolicy");
const { sendResetEmail } = require("../services/emailService");

const RESET_EXPIRY_MS = 15 * 60 * 1000;

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// @desc   Admin login (email + password)
// @route  POST /api/users/admin-login
// @access Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+password");

    if (!user || user.role !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    if (!(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Forgot password — send reset email with single-use token (15 min)
// @route  POST /api/users/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter your email address" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond generically to avoid revealing account existence
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);

      // Invalidate any previous tokens for this user
      await PasswordResetToken.deleteMany({ user: user._id });

      await PasswordResetToken.create({
        user: user._id,
        tokenHash,
        expiresAt,
        used: false,
      });

      const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
      await sendResetEmail({ email: normalizedEmail, resetLink });
    }

    return res.json({
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent. The link expires in 15 minutes.",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reset password — verify single-use token and update password
// @route  POST /api/users/reset-password
// @access Public
const resetPassword = async (req, res) => {
  try {
    const { email, token, password, confirmPassword } = req.body;
    if (!email || !token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all required fields" });
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      return res.status(400).json({ success: false, message: pwdError });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reset link" });
    }

    const tokenHash = hashToken(token);
    const resetRecord = await PasswordResetToken.findOne({
      user: user._id,
      tokenHash,
    });

    if (!resetRecord || resetRecord.used) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or already-used reset link" });
    }

    if (Date.now() > new Date(resetRecord.expiresAt).getTime()) {
      await resetRecord.deleteOne();
      return res
        .status(400)
        .json({ success: false, message: "Reset link has expired. Please request a new one." });
    }

    user.password = password;
    await user.save();

    // Single-use: mark used and invalidate all previous tokens
    resetRecord.used = true;
    await resetRecord.save();
    await PasswordResetToken.deleteMany({
      user: user._id,
      _id: { $ne: resetRecord._id },
    });

    res.json({
      success: true,
      message: "Password updated successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { adminLogin, forgotPassword, resetPassword };
