const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    category: {
      type: String,
      default: "general",
      trim: true,
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
  },
  { timestamps: true }
);

faqSchema.index({ order: 1, createdAt: 1 });

const Faq = mongoose.model("Faq", faqSchema);
module.exports = Faq;
