const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getAllReviews,
  featureReview,
  deleteReview,
} = require("../controllers/ReviewController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

router.get("/product/:productId", getProductReviews);
router.get("/all", protect, authorize("admin"), getAllReviews);

router.post("/", protect, upload.array("images", 4), createReview);

router.put("/:id/feature", protect, authorize("admin"), featureReview);
router.delete("/:id", protect, authorize("admin"), deleteReview);

module.exports = router;
