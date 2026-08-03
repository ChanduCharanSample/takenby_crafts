const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getAnalytics,
  getAllCustomizations,
} = require("../controllers/AdminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/stats", protect, authorize("admin"), getAdminStats);
router.get("/analytics", protect, authorize("admin"), getAnalytics);
router.get("/customizations", protect, authorize("admin"), getAllCustomizations);

module.exports = router;