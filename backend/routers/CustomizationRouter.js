const express = require("express");
const router = express.Router();
const {
  createCustomization,
  getMyCustomizations,
  getAllCustomizations,
  getCustomizationById,
  updateCustomizationStatus,
  cancelCustomization,
} = require("../controllers/CustomizationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

router.get("/my", protect, getMyCustomizations);
router.get("/all", protect, authorize("admin"), getAllCustomizations);

router.post("/", protect, upload.single("referenceImage"), createCustomization);

router.get("/:id", protect, getCustomizationById);
router.put("/:id/status", protect, authorize("admin"), updateCustomizationStatus);
router.put("/:id/cancel", protect, cancelCustomization);

module.exports = router;
