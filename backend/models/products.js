const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [90, "Discount cannot be more than 90%"],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    images: [
      {
        type: String,
      },
    ],
    coverImage: {
      type: String,
      default: "",
    },
    materials: {
      type: String,
      default: "",
    },
    colors: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    preparationTime: {
      type: String,
      default: "3-5 days",
    },
    customizable: {
      type: Boolean,
      default: false,
    },
    isPersonalized: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "hidden", "archived"],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.virtual("finalPrice").get(function () {
  return Math.round(this.price - (this.price * this.discount) / 100);
});

productSchema.pre("save", function (next) {
  const valid = ["draft", "published", "hidden", "archived"];
  if (!this.status || !valid.includes(this.status)) {
    this.status = this.isArchived ? "archived" : this.isActive ? "published" : "hidden";
  }
  switch (this.status) {
    case "published":
      this.isActive = true;
      this.isArchived = false;
      break;
    case "hidden":
      this.isActive = false;
      this.isArchived = false;
      break;
    case "archived":
      this.isActive = false;
      this.isArchived = true;
      break;
    case "draft":
    default:
      this.isActive = false;
      this.isArchived = false;
      break;
  }
  next();
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
