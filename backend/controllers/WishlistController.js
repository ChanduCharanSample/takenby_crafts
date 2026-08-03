const Wishlist = require("../models/wishlists");
const Product = require("../models/products");

const getWishlistForUser = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate(
    "items.product",
    "name price discount stock images customizable category averageRating"
  );
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  return wishlist;
};

// @desc   Get user wishlist
// @route  GET /api/wishlist
// @access Private
const getWishlist = async (req, res) => {
  try {
    const wishlist = await getWishlistForUser(req.user._id);
    res.json({
      success: true,
      wishlist,
      count: wishlist.items.length,
    });
  } catch (error) {
    console.error("Get wishlist error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Add to wishlist
// @route  POST /api/wishlist
// @access Private
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let wishlist = await getWishlistForUser(req.user._id);
    const exists = wishlist.items.find(
      (i) => String(i.product._id) === String(productId)
    );
    if (!exists) {
      wishlist.items.push({ product: productId });
      await wishlist.save();
    }

    res.json({ success: true, message: "Added to wishlist", count: wishlist.items.length });
  } catch (error) {
    console.error("Add to wishlist error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Remove from wishlist
// @route  DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = async (req, res) => {
  try {
    let wishlist = await getWishlistForUser(req.user._id);
    wishlist.items = wishlist.items.filter(
      (i) => String(i.product._id) !== String(req.params.productId)
    );
    await wishlist.save();
    res.json({ success: true, message: "Removed from wishlist", count: wishlist.items.length });
  } catch (error) {
    console.error("Remove from wishlist error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
