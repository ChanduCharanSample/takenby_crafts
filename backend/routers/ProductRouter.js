const express = require("express");
const router = express.Router();
const {
  getProducts,
  getAllProductsAdmin,
  getProductById,
  getRelatedProducts,
  searchSuggestions,
  createProduct,
  updateProduct,
  reorderImages,
  deleteProductImage,
  archiveProduct,
  restoreProduct,
  publishProduct,
  duplicateProduct,
  deleteProduct,
} = require("../controllers/ProductController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

router.get("/", getProducts);
router.get("/all", protect, authorize("admin"), getAllProductsAdmin);
router.get("/search/suggest", searchSuggestions);
router.get("/:id/related", getRelatedProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 8),
  createProduct
);

router.post("/:id/duplicate", protect, authorize("admin"), duplicateProduct);

router.put("/:id/images/reorder", protect, authorize("admin"), reorderImages);
router.delete("/:id/images", protect, authorize("admin"), deleteProductImage);

router.put("/:id/archive", protect, authorize("admin"), archiveProduct);
router.put("/:id/restore", protect, authorize("admin"), restoreProduct);
router.put("/:id/publish", protect, authorize("admin"), publishProduct);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 8),
  updateProduct
);

router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
