const Review = require("../models/reviews");
const Order = require("../models/orders");
const Product = require("../models/products");
const { storeFiles, deleteImage } = require("../services/imageStorage");

// @desc   Create a review (only for delivered & purchased products)
// @route  POST /api/reviews
// @access Private
const createReview = async (req, res) => {
  try {
    const { product, order, rating, comment } = req.body;

    if (!product || !order || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product, order, rating and review are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (String(orderDoc.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "You can only review your own orders" });
    }

    if (orderDoc.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "You can review a product only after it is delivered",
      });
    }

    const purchased = orderDoc.items.find(
      (i) => String(i.product) === String(product)
    );
    if (!purchased) {
      return res
        .status(400)
        .json({ success: false, message: "You did not purchase this product" });
    }

    const alreadyReviewed = await Review.findOne({ product, user: req.user._id });
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ success: false, message: "You have already reviewed this product" });
    }

    const reviewImages = req.files && req.files.length ? await storeFiles(req.files) : [];
    const review = await Review.create({
      user: req.user._id,
      product,
      order,
      rating: Number(rating),
      comment,
      image: reviewImages[0] || "",
      images: reviewImages,
      verified: true,
    });

    await updateProductRating(product);

    res.status(201).json({ success: true, message: "Review submitted", review });
  } catch (error) {
    console.error("Create review error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  });
};

// @desc   Get reviews for a product
// @route  GET /api/reviews/product/:productId
// @access Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error("Get reviews error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all reviews (admin)
// @route  GET /api/reviews/all
// @access Private (admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "firstName lastName")
      .populate("product", "name images coverImage")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error("Get all reviews error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Toggle review featured (admin)
// @route  PUT /api/reviews/:id/feature
// @access Private (admin)
const featureReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    review.featured = !review.featured;
    await review.save();
    res.json({ success: true, message: review.featured ? "Review featured" : "Review unfeatured", review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete review (admin)
// @route  DELETE /api/reviews/:id
// @access Private (admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    const productId = review.product;
    const images = [review.image, ...(review.images || [])];
    for (const img of images) {
      await deleteImage(img);
    }
    await review.deleteOne();
    await updateProductRating(productId);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getAllReviews,
  featureReview,
  deleteReview,
};
