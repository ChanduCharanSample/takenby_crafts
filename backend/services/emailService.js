const nodemailer = require("nodemailer");

const BRAND = "TakenBy_Crafts";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  let port = Number(process.env.SMTP_PORT) || 587;
  if (host.includes("brevo") && port === 587) port = 2525;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    family: 4,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

const smtpConfigured = () => {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

// @desc   Send an email (logs to console in dev when SMTP is not configured)
const sendEmail = async ({ to, subject, html, text }) => {
  if (!smtpConfigured()) {
    console.log(
      `[DEV EMAIL] to=${to} subject="${subject}"\n${text || ""}\n${html || ""}`
    );
    return { success: true, dev: true };
  }

  const fromName = process.env.EMAIL_FROM || BRAND;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
  try {
    await getTransporter().sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error.message, "| code:", error.code);
    return { success: false, message: `${error.message} (${error.code})` };
  }
};

const sendOtpEmail = async ({ email, name, otp }) => {
  const subject = "TakenBy_Crafts - Verify Your Email";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
      <h2 style="color:#c77b5a;margin:0 0 16px;">TakenBy_Crafts 🎨</h2>
      <p>Hello ${name || "there"},</p>
      <p>Welcome to TakenBy_Crafts!</p>
      <p>Your verification code is:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#3a2e2a;background:#fdf6ee;border-radius:8px;text-align:center;padding:16px;margin:16px 0;">${otp}</div>
      <p>This code is valid for 5 minutes.</p>
      <p>If you did not request this verification, please ignore this email.</p>
      <br/>
      <p>Thank you,<br/><strong>TakenBy_Crafts</strong><br/>Handmade with Heart ❤️</p>
    </div>
  `;
  const text = `Hello ${name || "there"},\n\nWelcome to TakenBy_Crafts!\n\nYour verification code is: ${otp}\n\nThis code is valid for 5 minutes.\n\nIf you did not request this verification, please ignore this email.\n\nThank you,\nTakenBy_Crafts\nHandmade with Heart ❤️`;
  return sendEmail({ to: email, subject, html, text });
};

const sendResetEmail = async ({ email, resetLink }) => {
  const subject = "TakenBy_Crafts - Reset Your Password";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
      <h2 style="color:#c77b5a;margin:0 0 16px;">TakenBy_Crafts 🎨</h2>
      <p>Hello,</p>
      <p>We received a request to reset your TakenBy_Crafts account password.</p>
      <p>Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong> and can only be used once.</p>
      <a href="${resetLink}" style="display:inline-block;background:#c77b5a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;margin:16px 0;">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will stay unchanged.</p>
      <br/>
      <p>Thank you,<br/><strong>TakenBy_Crafts</strong><br/>Handmade with Heart ❤️</p>
    </div>
  `;
  const text = `Hello,\n\nWe received a request to reset your TakenBy_Crafts account password.\n\nOpen this link to choose a new password (valid for 15 minutes, single use):\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nThank you,\nTakenBy_Crafts`;
  return sendEmail({ to: email, subject, html, text });
};

const sendOrderConfirmationEmail = async ({ email, name, order }) => {
  const subject = "Thank You for Shopping with TakenBy_Crafts";
  const itemsHtml = (order.items || [])
    .map(
      (it) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;">${it.name} × ${it.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">₹${Math.round(it.price * it.quantity).toLocaleString("en-IN")}</td>
        </tr>`
    )
    .join("");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
      <h2 style="color:#c77b5a;margin:0 0 16px;">TakenBy_Crafts 🎨</h2>
      <p>Hello ${name || "there"},</p>
      <p>Thank you for shopping with <strong>TakenBy_Crafts</strong>! Your order has been placed successfully.</p>
      <p>Order ID: <strong>#${String(order._id).slice(-8).toUpperCase()}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsHtml}
        <tr>
          <td style="padding:10px 12px;font-size:14px;font-weight:700;">Total</td>
          <td style="padding:10px 12px;font-size:14px;font-weight:700;text-align:right;">₹${Math.round(order.total).toLocaleString("en-IN")}</td>
        </tr>
      </table>
      <p>We'll update you as your order progresses.</p>
      <br/>
      <p>Thank you,<br/><strong>TakenBy_Crafts</strong><br/>Handmade with Heart ❤️</p>
    </div>
  `;
  const text = `Hello ${name || "there"},\n\nThank you for shopping with TakenBy_Crafts! Your order #${String(order._id).slice(-8).toUpperCase()} has been placed successfully.\n\nWe'll update you as your order progresses.\n\nThank you,\nTakenBy_Crafts\nHandmade with Heart ❤️`;
  return sendEmail({ to: email, subject, html, text });
};

module.exports = { sendEmail, sendOtpEmail, sendResetEmail, sendOrderConfirmationEmail, smtpConfigured };
