const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  reorder,
  updateOrderStatus,
  verifyPayment,
  getAllOrders,
  getPendingPayments,
  getInventoryLogs,
} = require("../controllers/OrderController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getUserOrders);
router.get("/pending-payments", protect, authorize("admin"), getPendingPayments);
router.get("/inventory-logs", protect, authorize("admin"), getInventoryLogs);
router.get("/", protect, authorize("admin"), getAllOrders);

router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
router.post("/:id/reorder", protect, reorder);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);
router.put("/:id/verify-payment", protect, authorize("admin"), verifyPayment);

module.exports = router;
