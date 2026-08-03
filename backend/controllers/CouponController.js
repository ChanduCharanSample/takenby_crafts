const Coupon = require("../models/coupons");

// @desc   Validate a coupon code
// @route  POST /api/coupons/validate
// @access Private
const validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid coupon code" });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Coupon is not active" });
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }
    if (amount !== undefined && amount < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minOrder} required`,
      });
    }

    let discount =
      coupon.discountType === "percentage"
        ? (amount * coupon.discountValue) / 100
        : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.round(discount);

    res.json({ success: true, coupon, discount });
  } catch (error) {
    console.error("Validate coupon error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all coupons (admin)
// @route  GET /api/coupons
// @access Private (admin)
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    console.error("Get coupons error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create coupon (admin)
// @route  POST /api/coupons
// @access Private (admin)
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrder,
      maxDiscount,
      expiryDate,
      usageLimit,
    } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Code, discount value and expiry date are required",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description: description || "",
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      minOrder: Number(minOrder) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      expiryDate,
      usageLimit: Number(usageLimit) || 0,
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({ success: true, message: "Coupon created", coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    }
    console.error("Create coupon error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update coupon (admin)
// @route  PUT /api/coupons/:id
// @access Private (admin)
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    const fields = [
      "code",
      "description",
      "discountType",
      "discountValue",
      "minOrder",
      "maxDiscount",
      "expiryDate",
      "usageLimit",
      "isActive",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) coupon[f] = req.body[f];
    });
    if (req.body.code) coupon.code = req.body.code.toUpperCase();

    await coupon.save();
    res.json({ success: true, message: "Coupon updated", coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    }
    console.error("Update coupon error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete coupon (admin)
// @route  DELETE /api/coupons/:id
// @access Private (admin)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    await coupon.deleteOne();
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("Delete coupon error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
