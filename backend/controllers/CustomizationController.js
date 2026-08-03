const Customization = require("../models/customizations");
const Product = require("../models/products");
const { storeFile } = require("../services/imageStorage");

// @desc   Submit a customization request
// @route  POST /api/customizations
// @access Private
const createCustomization = async (req, res) => {
  try {
    const {
      product,
      customText,
      color,
      size,
      theme,
      occasion,
      specialInstructions,
      quantity,
    } = req.body;

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product is required" });
    }

    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (!productDoc.customizable) {
      return res
        .status(400)
        .json({ success: false, message: "This product is not customizable" });
    }

    const customization = await Customization.create({
      user: req.user._id,
      product,
      customText: customText || "",
      color: color || "",
      size: size || "",
      theme: theme || "",
      occasion: occasion || "",
      specialInstructions: specialInstructions || "",
      referenceImage: req.file ? await storeFile(req.file) : "",
      quantity: parseInt(quantity) || 1,
      estimatedPrice: productDoc.finalPrice * (parseInt(quantity) || 1),
    });

    res.status(201).json({
      success: true,
      message: "Customization request submitted. Our team will review it shortly.",
      customization,
    });
  } catch (error) {
    console.error("Create customization error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get custom requests of logged in user
// @route  GET /api/customizations/my
// @access Private
const getMyCustomizations = async (req, res) => {
  try {
    const customizations = await Customization.find({ user: req.user._id })
      .populate("product", "name images price")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: customizations.length, customizations });
  } catch (error) {
    console.error("Get my customizations error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get custom requests for admin
// @route  GET /api/customizations/all
// @access Private (admin)
const getAllCustomizations = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = {};
    if (status) filter.status = status;
    const customizations = await Customization.find(filter)
      .populate("product", "name images price")
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: customizations.length, customizations });
  } catch (error) {
    console.error("Get all customizations error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get customization by id (owner/admin)
// @route  GET /api/customizations/:id
// @access Private
const getCustomizationById = async (req, res) => {
  try {
    const customization = await Customization.findById(req.params.id)
      .populate("product", "name images price")
      .populate("user", "firstName lastName email phone address");
    if (!customization) {
      return res
        .status(404)
        .json({ success: false, message: "Customization not found" });
    }

    const isOwner = String(customization.user._id) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this request" });
    }

    res.json({ success: true, customization });
  } catch (error) {
    console.error("Get customization error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update customization status (admin)
// @route  PUT /api/customizations/:id/status
// @access Private (admin)
const updateCustomizationStatus = async (req, res) => {
  try {
    const { status, customPrice, customMessage, rejectedReason } = req.body;
    const customization = await Customization.findById(req.params.id);
    if (!customization) {
      return res
        .status(404)
        .json({ success: false, message: "Customization not found" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only the admin can manage this request" });
    }

    const validStatuses = [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected",
      "Awaiting Payment",
      "In Progress",
      "Completed",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    customization.status = status;
    if (customPrice !== undefined) customization.customPrice = Number(customPrice);
    if (customMessage !== undefined) customization.customMessage = customMessage;
    if (rejectedReason !== undefined)
      customization.rejectedReason = rejectedReason;

    if (status === "Approved" && !customization.customPrice) {
      customization.customPrice = customization.estimatedPrice;
    }

    await customization.save();
    res.json({ success: true, message: "Customization updated", customization });
  } catch (error) {
    console.error("Update customization error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Cancel own customization request (customer)
// @route  PUT /api/customizations/:id/cancel
// @access Private
const cancelCustomization = async (req, res) => {
  try {
    const customization = await Customization.findById(req.params.id);
    if (!customization) {
      return res
        .status(404)
        .json({ success: false, message: "Customization not found" });
    }
    if (String(customization.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (["In Progress", "Completed"].includes(customization.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a customization already in progress",
      });
    }
    customization.status = "Cancelled";
    await customization.save();
    res.json({ success: true, message: "Customization request cancelled" });
  } catch (error) {
    console.error("Cancel customization error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCustomization,
  getMyCustomizations,
  getAllCustomizations,
  getCustomizationById,
  updateCustomizationStatus,
  cancelCustomization,
};
