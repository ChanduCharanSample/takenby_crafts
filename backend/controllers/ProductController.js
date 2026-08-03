const Product = require("../models/products");
const Category = require("../models/categories");
const Review = require("../models/reviews");
const InventoryLog = require("../models/inventorylog");
const { storeFiles, deleteImage } = require("../services/imageStorage");

// @desc   Get products with search, filters, sorting, pagination
// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { isActive: true, isArchived: false };

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { sku: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.category) {
      const isObjId = /^[0-9a-fA-F]{24}$/.test(req.query.category);
      const cat = await Category.findOne(
        isObjId
          ? { $or: [{ slug: req.query.category }, { _id: req.query.category }] }
          : { slug: req.query.category }
      );
      if (cat) filter.category = cat._id;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.minRating) {
      filter.averageRating = { $gte: Number(req.query.minRating) };
    }

    if (req.query.inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    if (req.query.customizable === "true") {
      filter.customizable = true;
    }

    if (req.query.personalized === "true") {
      filter.isPersonalized = true;
    }

    if (req.query.featured === "true") {
      filter.featured = true;
    }

    if (req.query.bestSeller === "true") {
      filter.isBestSeller = true;
    }

    if (req.query.newArrival === "true") {
      filter.isNewArrival = true;
    }

    let sort = {};
    switch (req.query.sort) {
      case "price-asc":
        sort = { price: 1 };
        break;
      case "price-desc":
        sort = { price: -1 };
        break;
      case "rating":
        sort = { averageRating: -1 };
        break;
      case "best-selling":
        sort = { salesCount: -1 };
        break;
      case "most-viewed":
        sort = { viewCount: -1 };
        break;
      case "newest":
      default:
        sort = { createdAt: -1 };
        break;
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all products for admin (including hidden/archived)
// @route  GET /api/products/all
// @access Private (admin)
const getAllProductsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status === "published") filter = { $or: [{ status: "published" }, { status: { $exists: false }, isActive: true, isArchived: false }] };
    if (status === "draft") filter = { status: "draft" };
    if (status === "hidden") filter = { $or: [{ status: "hidden" }, { status: { $exists: false }, isActive: false, isArchived: false }] };
    if (status === "archived") filter = { $or: [{ status: "archived" }, { status: { $exists: false }, isArchived: true }] };
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single product
// @route  GET /api/products/:id
// @access Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });
    product.viewCount = (product.viewCount || 0) + 1;

    const reviews = await Review.find({ product: product._id })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({ success: true, product, reviews });
  } catch (error) {
    console.error("Get product error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get related products
// @route  GET /api/products/:id/related
// @access Public
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const base = { _id: { $ne: product._id }, isActive: true, isArchived: false };
    const sameCategory = await Product.find({
      ...base,
      category: product.category,
    })
      .sort({ salesCount: -1, createdAt: -1 })
      .limit(6)
      .populate("category", "name slug");

    const ids = sameCategory.map((p) => p._id);
    const fill = [];
    if (sameCategory.length < 6) {
      const needed = 6 - sameCategory.length;
      const extras = await Product.find({
        ...base,
        _id: { $nin: [product._id, ...ids] },
        $or: [{ isPersonalized: true }, { isBestSeller: true }, { featured: true }],
      })
        .sort({ salesCount: -1, createdAt: -1 })
        .limit(needed)
        .populate("category", "name slug");
      fill.push(...extras);
    }
    const related = [...sameCategory, ...fill];
    res.json({ success: true, products: related });
  } catch (error) {
    console.error("Related products error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const parseBool = (v) => v === "true" || v === true;

// @desc   Search suggestions (product names + categories)
// @route  GET /api/products/search/suggest?q=...
// @access Public
const searchSuggestions = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.json({ success: true, products: [], categories: [] });
    }
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const [products, categories] = await Promise.all([
      Product.find({
        isActive: true,
        isArchived: false,
        $or: [{ name: regex }, { shortDescription: regex }, { sku: regex }],
      })
        .select("name coverImage images price discount shortDescription")
        .limit(6),
      Category.find({ name: regex, isActive: true })
        .select("name slug image")
        .limit(5),
    ]);
    res.json({ success: true, products, categories });
  } catch (error) {
    console.error("Search suggestions error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create product (admin)
// @route  POST /api/products
// @access Private (admin)
const createProduct = async (req, res) => {
  try {
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    const {
      name,
      shortDescription,
      description,
      category,
      sku,
      price,
      discount,
      stock,
      lowStockThreshold,
      materials,
      colors,
      size,
      preparationTime,
      customizable,
      isPersonalized,
      featured,
      isBestSeller,
      isNewArrival,
    } = body;

    if (!name || !description || !category || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill required fields" });
    }

    const catExists = await Category.findById(category);
    if (!catExists) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const images = req.files && req.files.length ? await storeFiles(req.files) : [];
    const coverImage = req.body.coverImage || images[0] || "";

    const product = await Product.create({
      name,
      shortDescription: shortDescription || "",
      description,
      category,
      sku: sku || "",
      price: Number(price),
      discount: Number(discount) || 0,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      images,
      coverImage,
      materials: materials || "",
      colors: colors || "",
      size: size || "",
      preparationTime: preparationTime || "3-5 days",
      customizable: parseBool(customizable),
      isPersonalized: parseBool(isPersonalized),
      featured: parseBool(featured),
      isBestSeller: parseBool(isBestSeller),
      isNewArrival: parseBool(isNewArrival),
      isActive: body.isActive === "false" || body.isActive === false ? false : true,
      status: body.status || (body.isActive === "false" || body.isActive === false ? "hidden" : "published"),
    });

    if (stock) {
      await InventoryLog.create({
        product: product._id,
        productName: name,
        changeType: "adjust",
        quantityChange: Number(stock),
        stockAfter: Number(stock),
        note: "Initial stock",
        user: req.user._id,
      });
    }

    res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) {
    console.error("Create product error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update product (admin)
// @route  PUT /api/products/:id
// @access Private (admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    const fields = [
      "name",
      "shortDescription",
      "description",
      "category",
      "sku",
      "price",
      "discount",
      "stock",
      "lowStockThreshold",
      "materials",
      "colors",
      "size",
      "preparationTime",
      "customizable",
      "isPersonalized",
      "featured",
      "isBestSeller",
      "isNewArrival",
      "isActive",
      "isArchived",
      "status",
      "coverImage",
    ];
    fields.forEach((f) => {
      if (body[f] !== undefined) {
        if (["customizable", "isPersonalized", "featured", "isBestSeller", "isNewArrival", "isActive", "isArchived"].includes(f)) {
          product[f] = parseBool(body[f]);
        } else if (["price", "discount", "stock", "lowStockThreshold"].includes(f)) {
          product[f] = Number(body[f]) || 0;
        } else {
          product[f] = body[f];
        }
      }
    });

    if (body.status === undefined && (body.isActive !== undefined || body.isArchived !== undefined)) {
      product.status = product.isArchived ? "archived" : product.isActive ? "published" : "hidden";
    }

    if (body.stock !== undefined && Number(body.stock) !== product.stock) {
      await InventoryLog.create({
        product: product._id,
        productName: product.name,
        changeType: "adjust",
        quantityChange: Number(body.stock) - product.stock,
        stockAfter: Number(body.stock),
        note: body.stockNote || "Stock adjusted by admin",
        user: req.user._id,
      });
    }

    if (req.files && req.files.length) {
      const newImages = await storeFiles(req.files);
      const existing = body.existingImages
        ? typeof body.existingImages === "string"
          ? JSON.parse(body.existingImages)
          : body.existingImages
        : product.images;
      product.images = [...existing, ...newImages];
      if (!product.coverImage) product.coverImage = product.images[0] || "";
    }

    await product.save();
    res.json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reorder images / set cover
// @route  PUT /api/products/:id/images/reorder
// @access Private (admin)
const reorderImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const { images, coverImage } = req.body;
    if (Array.isArray(images)) product.images = images;
    if (coverImage) product.coverImage = coverImage;
    await product.save();
    res.json({ success: true, message: "Images updated", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete product image
// @route  DELETE /api/products/:id/images?image=...
// @access Private (admin)
const deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const filename = req.query.image;
    product.images = product.images.filter((img) => img !== filename);
    if (product.coverImage === filename) product.coverImage = product.images[0] || "";
    await product.save();
    await deleteImage(filename);
    res.json({ success: true, message: "Image removed", images: product.images, coverImage: product.coverImage });
  } catch (error) {
    console.error("Delete image error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Archive product
// @route  PUT /api/products/:id/archive
// @access Private (admin)
const archiveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    product.isArchived = true;
    product.isActive = false;
    product.status = "archived";
    await product.save();
    res.json({ success: true, message: "Product archived", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Restore archived product
// @route  PUT /api/products/:id/restore
// @access Private (admin)
const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    product.isArchived = false;
    product.isActive = true;
    product.status = "published";
    await product.save();
    res.json({ success: true, message: "Product restored", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Publish / hide product
// @route  PUT /api/products/:id/publish
// @access Private (admin)
const publishProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const { published } = req.body;
    product.isActive = published === "false" || published === false ? false : true;
    product.status = product.isActive ? "published" : "hidden";
    if (product.isActive) product.isArchived = false;
    await product.save();
    res.json({ success: true, message: product.isActive ? "Product published" : "Product hidden", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Duplicate product
// @route  POST /api/products/:id/duplicate
// @access Private (admin)
const duplicateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const copy = {
      ...product.toObject(),
      _id: undefined,
      name: `${product.name} (Copy)`,
      sku: product.sku ? `${product.sku}-COPY` : "",
      stock: 0,
      salesCount: 0,
      viewCount: 0,
      reviewCount: 0,
      averageRating: 0,
      featured: false,
      isBestSeller: false,
      isNewArrival: false,
      isActive: false,
      isArchived: false,
      status: "draft",
      createdAt: undefined,
      updatedAt: undefined,
    };
    const duplicated = await Product.create(copy);
    res.status(201).json({ success: true, message: "Product duplicated (draft)", product: duplicated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Private (admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    for (const img of product.images) {
      await deleteImage(img);
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
