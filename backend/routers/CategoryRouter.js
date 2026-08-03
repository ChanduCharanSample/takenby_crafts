const express = require("express");
const router = express.Router();
const {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
} = require("../controllers/CategoryController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

router.get("/", getCategories);
router.get("/all", protect, authorize("admin"), getAllCategories);
router.get("/:id", getCategory);

router.post("/", protect, authorize("admin"), upload.any(), createCategory);
router.put("/reorder", protect, authorize("admin"), reorderCategories);
router.put("/:id", protect, authorize("admin"), upload.any(), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
