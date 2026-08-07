const User = require("../models/users");
const Product = require("../models/products");
const Order = require("../models/orders");
const Category = require("../models/categories");
const Review = require("../models/reviews");
const Coupon = require("../models/coupons");
const Customization = require("../models/customizations");
const Announcement = require("../models/announcements");
const Reel = require("../models/reels");
const ContactMessage = require("../models/contactMessage");

// @desc   Get admin dashboard stats
// @route  GET /api/admin/stats
// @access Private (admin)
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      pendingOrders,
      completedOrders,
      revenueToday,
      revenueThisMonth,
      totalCategories,
      totalReviews,
      totalCoupons,
      totalAnnouncements,
      totalReels,
      pendingCustomizations,
      pendingPayments,
      lowStockProducts,
      unreadMessages,
      recentOrders,
      recentReviews,
      topProducts,
      monthlySales,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isArchived: false }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $nin: ["Cancelled"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({
        status: { $in: ["Order Placed", "Confirmed", "Preparing", "Ready to Ship", "Shipped"] },
      }),
      Order.countDocuments({ status: "Delivered" }),
      Order.aggregate([
        {
          $match: {
            status: { $nin: ["Cancelled"] },
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $nin: ["Cancelled"] },
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Category.countDocuments(),
      Review.countDocuments(),
      Coupon.countDocuments(),
      Announcement.countDocuments(),
      Reel.countDocuments(),
      Customization.countDocuments({ status: { $in: ["Pending", "Under Review"] } }),
      Order.countDocuments({ status: "Payment Verification Pending" }),
      Product.find({
        isArchived: false,
        $expr: { $lte: ["$stock", "$lowStockThreshold"] },
      })
        .select("name stock lowStockThreshold images coverImage")
        .limit(8),
      ContactMessage.countDocuments({ status: "Unread" }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "firstName lastName"),
      Review.find().sort({ createdAt: -1 }).limit(5).populate("user", "firstName lastName").populate("product", "name"),
      Product.find({ salesCount: { $gt: 0 } })
        .sort({ salesCount: -1 })
        .limit(5)
        .select("name salesCount price images coverImage"),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenue.length ? revenue[0].total : 0,
        pendingOrders,
        completedOrders,
        revenueToday: revenueToday.length ? revenueToday[0].total : 0,
        revenueThisMonth: revenueThisMonth.length ? revenueThisMonth[0].total : 0,
        totalCategories,
        totalReviews,
        totalCoupons,
        totalAnnouncements,
        totalReels,
        pendingCustomizations,
        pendingPayments,
        lowStock: lowStockProducts,
        lowStockCount: lowStockProducts.length,
        unreadMessages,
        recentOrders,
        recentReviews,
        topProducts,
        monthlySales,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get analytics data (orders over time, top products, categories)
// @route  GET /api/admin/analytics
// @access Private (admin)
const getAnalytics = async (req, res) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [salesByDay, topProducts, categoryDistribution, ordersByStatus, mostViewed, mostOrderedCategories] =
      await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: last30Days }, status: { $ne: "Cancelled" } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              total: { $sum: "$total" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Product.find({ salesCount: { $gt: 0 } })
          .sort({ salesCount: -1 })
          .limit(5)
          .select("name salesCount price images coverImage"),
        Product.aggregate([
          { $match: { isArchived: false } },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
        ]),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Product.find({ isArchived: false })
          .sort({ viewCount: -1 })
          .limit(5)
          .select("name viewCount salesCount price images coverImage"),
        Order.aggregate([
          {
            $unwind: "$items",
          },
          {
            $group: { _id: "$items.product", count: { $sum: "$items.quantity" } },
          },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
      ]);

    const categories = await Category.find({ _id: { $in: categoryDistribution.map((c) => c._id) } }).select("name");
    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[String(c._id)] = c.name;
    });

    const orderedCatIds = mostOrderedCategories.map((c) => String(c._id));
    const orderedCats = await Product.find({ _id: { $in: orderedCatIds } })
      .select("category")
      .lean();
    const catIdToName = {};
    categories.forEach((c) => (catIdToName[String(c._id)] = c.name));
    const prodIdToCatName = {};
    orderedCats.forEach((p) => {
      const cid = String(p.category);
      prodIdToCatName[String(p._id)] = catIdToName[cid] || "Unknown";
    });

    res.json({
      success: true,
      analytics: {
        salesByDay,
        topProducts,
        mostViewed,
        categoryDistribution: categoryDistribution.map((c) => ({
          name: categoryMap[String(c._id)] || "Unknown",
          count: c.count,
        })),
        mostOrderedCategories: mostOrderedCategories.map((c) => ({
          name: prodIdToCatName[String(c._id)] || "Unknown",
          count: c.count,
        })),
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all customizations (admin)
// @route  GET /api/admin/customizations
// @access Private (admin)
const getAllCustomizations = async (req, res) => {
  try {
    const customizations = await Customization.find()
      .populate("user", "firstName lastName email")
      .populate("product", "name images price")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: customizations.length, customizations });
  } catch (error) {
    console.error("Get all customizations error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminStats, getAnalytics, getAllCustomizations };
