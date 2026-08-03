const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    photo: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "Verified Customer",
    },
    comment: {
      type: String,
      required: [true, "Review is required"],
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    featured: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "published",
      enum: ["published", "hidden"],
    },
    sourceReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },
  },
  { timestamps: true }
);

testimonialSchema.index({ featured: -1, order: 1, createdAt: -1 });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);
module.exports = Testimonial;
