const mongoose = require("mongoose");

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["register", "login"],
      required: [true, "OTP purpose is required"],
    },
    otpHash: {
      type: String,
      required: [true, "OTP hash is required"],
    },
    name: {
      type: String,
      default: "",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

emailOtpSchema.index({ email: 1, purpose: 1 }, { unique: true });
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailOtp = mongoose.model("EmailOtp", emailOtpSchema);
module.exports = EmailOtp;
