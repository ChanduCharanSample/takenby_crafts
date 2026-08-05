const Category = require("../models/categories");
const { storeFile, deleteImage } = require("../services/imageStorage");

// @desc   Get all active categories (ordered)
// @route  GET /api/categories
// @access Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      { $match: { isActive: true } },
      { $sort: { order: 1, name: 1 } },
    ]).allowDiskUse(true);
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    console.error("Get categories error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all categories including inactive (admin)
// @route  GET /api/categories/all
// @access Private/Admin
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      { $sort: { order: 1, name: 1 } },
    ]).allowDiskUse(true);
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    console.error("Get all categories error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single category
// @route  GET /api/categories/:id
// @access Public
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, category });
  } catch (error) {
    console.error("Get category error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create category
// @route  POST /api/categories
// @access Private/Admin
const createCategory = async (req, res) => {
  try {
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    const name = body.name;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }
    const image = req.files && req.files[0] ? await storeFile(req.files[0]) : body.image || "";
    const category = await Category.create({
      name,
      description: body.description || "",
      image,
      isActive: body.isActive === "false" || body.isActive === false ? false : true,
      order: Number(body.order) || 0,
    });
    res.status(201).json({ success: true, message: "Category created", category });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }
    console.error("Create category error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update category
// @route  PUT /api/categories/:id
// @access Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (body.name) category.name = body.name;
    if (body.description !== undefined) category.description = body.description;
    if (body.order !== undefined) category.order = Number(body.order) || 0;
    if (typeof body.isActive === "boolean" || body.isActive === "true" || body.isActive === "false") {
      category.isActive = body.isActive === "true" || body.isActive === true;
    }
    if (body.image && !req.files) category.image = body.image;
    if (req.files && req.files[0]) category.image = await storeFile(req.files[0]);
    await category.save();
    res.json({ success: true, message: "Category updated", category });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }
    console.error("Update category error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reorder categories
// @route  PUT /api/categories/reorder
// @access Private/Admin
const reorderCategories = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: "Invalid order payload" });
    }
    for (const id of order) {
      await Category.findByIdAndUpdate(id, {
        $set: { order: order.indexOf(id) },
      });
    }
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json({ success: true, message: "Categories reordered", categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete category
// @route  DELETE /api/categories/:id
// @access Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    await category.deleteOne();
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
};
