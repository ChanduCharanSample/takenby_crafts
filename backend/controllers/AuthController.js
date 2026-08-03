const User = require("../models/users");
const Cart = require("../models/carts");
const Wishlist = require("../models/wishlists");
const jwt = require("jsonwebtoken");
const { createOtp, verifyOtp } = require("../services/otpService");
const { validatePassword } = require("../utils/passwordPolicy");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const splitName = (fullName) => {
  const parts = String(fullName || "").trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

const publicUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  address: user.address,
  isApproved: user.isApproved,
});

// @desc   Step 1 of registration — validate + send OTP (account NOT created yet)
// @route  POST /api/users/register/request
// @access Public
const requestRegisterOtp = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all required fields" });
    }

    if (!/^[0-9]{10,15}$/.test(String(phone))) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid mobile number (10 digits)" });
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

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "This email is already registered. Please login." });
    }

    const existingPhone = await User.findOne({ phone: String(phone) });
    if (existingPhone) {
      return res
        .status(400)
        .json({ success: false, message: "This mobile number is already registered." });
    }

    const { firstName, lastName } = splitName(fullName);
    const result = await createOtp({
      email: normalizedEmail,
      purpose: "register",
      name: firstName,
      data: {
        fullName,
        firstName,
        lastName,
        email: normalizedEmail,
        phone: String(phone),
        password,
      },
    });

    if (!result.success) {
      return res.status(429).json({ success: false, message: result.message, retryAfter: result.retryAfter });
    }

    return res.json({
      success: true,
      message: "Verification code sent to your email. It expires in 5 minutes.",
      dev: Boolean(result.dev),
    });
  } catch (error) {
    console.error("Request register OTP error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Step 2 of registration — verify OTP + create account
// @route  POST /api/users/register/verify
// @access Public
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and verification code are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const check = await verifyOtp({ email: normalizedEmail, otp, purpose: "register" });
    if (!check.success) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const data = check.record?.data || {};
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "This email is already registered. Please login." });
    }

    const user = await User.create({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: normalizedEmail,
      phone: data.phone,
      password: data.password,
      role: "customer",
      isApproved: true,
      address: { street: "", city: "", state: "", pincode: "" },
    });

    await Cart.create({ user: user._id, items: [] });
    await Wishlist.create({ user: user._id, items: [] });

    res.status(201).json({
      success: true,
      message: "Account created successfully. Welcome to TakenBy_Crafts!",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Verify register OTP error:", error.message);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email or mobile number already registered." });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Customer login (email + password)
// @route  POST /api/users/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter your email and password" });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+password");

    if (!user || user.role === "admin") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestRegisterOtp,
  verifyRegisterOtp,
  login,
  generateToken,
  publicUser,
};
