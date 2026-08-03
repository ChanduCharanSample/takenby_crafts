const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = require("../controllers/CartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.post("/coupon", applyCoupon);
router.delete("/coupon", removeCoupon);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);

module.exports = router;
