const crypto = require("crypto");
const EmailOtp = require("../models/emailotp");
const { sendOtpEmail } = require("./emailService");

const OTP_EXPIRY_MS = (Number(process.env.OTP_EXPIRY) || 5) * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const hashOtp = (otp, email) => {
  return crypto.createHash("sha256").update(`${otp}:${email}`).digest("hex");
};

const generateOtp = () => {
  return String(crypto.randomInt(100000, 1000000));
};

// @desc   Create (or refresh) an OTP for an email + purpose
const createOtp = async ({ email, purpose, name, data }) => {
  email = String(email || "").toLowerCase().trim();

  const existing = await EmailOtp.findOne({ email, purpose });
  if (existing) {
    const elapsed = Date.now() - new Date(existing.lastSentAt).getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return {
        success: false,
        retryAfter: waitSec,
        message: `Please wait ${waitSec} seconds before requesting a new code.`,
      };
    }
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp, email);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  if (existing) {
    existing.otpHash = otpHash;
    existing.attempts = 0;
    existing.expiresAt = expiresAt;
    existing.lastSentAt = new Date();
    existing.name = name || existing.name || "";
    if (data) existing.data = data;
    await existing.save();
  } else {
    await EmailOtp.create({
      email,
      purpose,
      name: name || "",
      data: data || null,
      otpHash,
      attempts: 0,
      expiresAt,
      lastSentAt: new Date(),
    });
  }

  const emailRes = await sendOtpEmail({ email, name, otp });
  if (emailRes && emailRes.success === false && !emailRes.dev) {
    return { success: false, message: emailRes.message || "Could not send OTP" };
  }

  const isDev = Boolean(emailRes && emailRes.dev);
  return {
    success: true,
    dev: isDev,
    // Only expose the OTP in dev mode (SMTP not configured). Remove when email is live.
    otp: isDev ? otp : undefined,
  };
};

// @desc   Verify an OTP for an email + purpose. Single-use, 5 attempts, 5 min expiry.
const verifyOtp = async ({ email, otp, purpose }) => {
  email = String(email || "").toLowerCase().trim();
  if (!otp || !/^\d{6}$/.test(String(otp))) {
    return { success: false, message: "Please enter the 6-digit code." };
  }

  const record = await EmailOtp.findOne({ email, purpose });
  if (!record) {
    return { success: false, message: "No active verification code found. Please request a new one." };
  }

  if (Date.now() > new Date(record.expiresAt).getTime()) {
    await EmailOtp.deleteOne({ _id: record._id });
    return { success: false, message: "This code has expired. Please request a new one." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await EmailOtp.deleteOne({ _id: record._id });
    return { success: false, message: "Too many attempts. Please request a new code." };
  }

  if (record.otpHash !== hashOtp(String(otp), email)) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      success: false,
      message:
        remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many attempts. Please request a new code.",
    };
  }

  await EmailOtp.deleteOne({ _id: record._id });
  return { success: true, record };
};

const deleteOtp = async (email, purpose) => {
  email = String(email || "").toLowerCase().trim();
  await EmailOtp.deleteMany({ email, purpose });
};

module.exports = { createOtp, verifyOtp, deleteOtp, generateOtp, OTP_EXPIRY_MS, RESEND_COOLDOWN_MS, MAX_ATTEMPTS };
