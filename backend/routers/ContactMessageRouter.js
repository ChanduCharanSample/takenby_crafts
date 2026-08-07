const express = require("express");
const router = express.Router();
const {
  submitMessage,
  listMessages,
  getUnreadCount,
  updateMessage,
  deleteMessage,
} = require("../controllers/ContactMessageController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", submitMessage);

router.get("/unread-count", protect, authorize("admin"), getUnreadCount);
router.get("/", protect, authorize("admin"), listMessages);
router.put("/:id", protect, authorize("admin"), updateMessage);
router.delete("/:id", protect, authorize("admin"), deleteMessage);

module.exports = router;
