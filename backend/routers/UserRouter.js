const express = require("express");
const router = express.Router();
const {
  requestRegisterOtp,
  verifyRegisterOtp,
  login,
} = require("../controllers/AuthController");
const {
  adminLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/PasswordResetController");
const {
  getUserProfile,
  updateUserProfile,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/UserController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// ---- Registration (email OTP) ----
router.post("/register/request", requestRegisterOtp);
router.post("/register/verify", verifyRegisterOtp);

// ---- Customer login (email + password) ----
router.post("/login", login);

// ---- Admin login (password) ----
router.post("/admin-login", adminLogin);

// ---- Forgot / reset password (customer & admin) ----
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get("/", protect, authorize("admin"), getUsers);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
