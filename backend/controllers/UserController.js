const User = require("../models/users");
const Cart = require("../models/carts");
const Wishlist = require("../models/wishlists");
const { publicUser } = require("./AuthController");
const { validatePassword } = require("../utils/passwordPolicy");

// @desc   Get logged in user profile
// @route  GET /api/users/profile
// @access Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update user profile
// @route  PUT /api/users/profile
// @access Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      const pwdError = validatePassword(req.body.password);
      if (pwdError) {
        return res.status(400).json({ success: false, message: pwdError });
      }
      if (req.body.password !== req.body.confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match" });
      }
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json({ success: true, message: "Profile updated", user: publicUser(updated) });
  } catch (error) {
    console.error("Update profile error:", error.message);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "This mobile number is already in use." });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all users (admin)
// @route  GET /api/users
// @access Private/Admin
const getUsers = async (req, res) => {
  try {
    const role = req.query.role;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update user (admin: role/approve/suspend)
// @route  PUT /api/users/:id
// @access Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.body.role) user.role = req.body.role;
    if (typeof req.body.isApproved === "boolean")
      user.isApproved = req.body.isApproved;

    await user.save();
    res.json({ success: true, message: "User updated", user });
  } catch (error) {
    console.error("Update user error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete user (admin)
// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role === "admin") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete an admin account" });
    }
    await Cart.deleteOne({ user: user._id });
    await Wishlist.deleteOne({ user: user._id });
    await user.deleteOne();
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUsers,
  updateUser,
  deleteUser,
};
