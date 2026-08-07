const ContactMessage = require("../models/contactMessage");
const Contact = require("../models/contact");
const Settings = require("../models/settings");
const { sendEmail } = require("../services/emailService");

const getAdminRecipient = async () => {
  const [contact, settings] = await Promise.all([Contact.findOne(), Settings.findOne()]);
  return (
    process.env.EMAIL_FROM_ADDRESS ||
    process.env.EMAIL_USER ||
    contact?.email ||
    settings?.email ||
    ""
  );
};

// @desc   Submit a contact form message (public)
// @route  POST /api/contact-messages
// @access Public
const submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Please enter your name" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    if (!message || String(message).trim().length < 10) {
      return res.status(400).json({ success: false, message: "Message should be at least 10 characters" });
    }

    const record = await ContactMessage.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      subject: subject ? String(subject).trim() : "",
      message: String(message).trim(),
    });

    const adminTo = await getAdminRecipient();
    if (adminTo) {
      sendEmail({
        to: adminTo,
        subject: `New Contact Form Submission - ${record.subject || record.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
            <h2 style="color:#c77b5a;margin:0 0 16px;">TakenBy_Crafts 🎨</h2>
            <p>You received a new message from the contact form:</p>
            <table style="width:100%;border-collapse:collapse;margin:12px 0;">
              <tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:700;">Name</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${record.name}</td></tr>
              <tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:700;">Email</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${record.email}</td></tr>
              ${record.phone ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:700;">Phone</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${record.phone}</td></tr>` : ""}
              ${record.subject ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:700;">Subject</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${record.subject}</td></tr>` : ""}
              <tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:700;">Message</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${record.message}</td></tr>
            </table>
            <p style="font-size:13px;color:#888;">Sent ${new Date(record.createdAt).toLocaleString("en-IN")} • Manage in the Admin panel → Contact Messages.</p>
          </div>
        `,
        text: `New message from ${record.name} (${record.email})${record.phone ? `, phone ${record.phone}` : ""}:${record.subject ? `\nSubject: ${record.subject}` : ""}\n\n${record.message}`,
      });
    }

    sendEmail({
      to: record.email,
      subject: "We've received your message - TakenBy_Crafts",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
          <h2 style="color:#c77b5a;margin:0 0 16px;">TakenBy_Crafts 🎨</h2>
          <p>Hello ${record.name},</p>
          <p>Thank you for reaching out to <strong>TakenBy_Crafts</strong>! We've received your message and our team will get back to you within <strong>24 hours</strong>.</p>
          <div style="background:#fdf6ee;border-radius:8px;padding:14px;margin:14px 0;font-size:14px;">
            <p style="margin:0 0 6px;font-weight:700;">Your message:</p>
            <p style="margin:0;color:#6b5d53;">"${record.message}"</p>
          </div>
          <p>Meanwhile, feel free to browse our latest handmade creations.</p>
          <br/>
          <p>Thank you,<br/><strong>TakenBy_Crafts</strong><br/>Handmade with Heart ❤️</p>
        </div>
      `,
      text: `Hello ${record.name},\n\nThank you for reaching out to TakenBy_Crafts! We've received your message and our team will get back to you within 24 hours.\n\nYour message:\n"${record.message}"\n\nThank you,\nTakenBy_Crafts`,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
      messageId: record._id,
    });
  } catch (error) {
    console.error("Submit contact message error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   List contact messages (admin)
// @route  GET /api/contact-messages?search=&status=&sort=newest|oldest
// @access Private (admin)
const listMessages = async (req, res) => {
  try {
    const { search = "", status = "", sort = "newest" } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ name: regex }, { email: regex }, { subject: regex }, { message: regex }];
    }

    const order = sort === "oldest" ? 1 : -1;
    const messages = await ContactMessage.find(query).sort({ createdAt: order });

    const counts = {};
    for (const s of ["Unread", "Read", "Replied", "Archived"]) {
      counts[s] = await ContactMessage.countDocuments({ status: s });
    }
    counts.total = await ContactMessage.countDocuments();

    res.json({ success: true, count: messages.length, counts, messages });
  } catch (error) {
    console.error("List contact messages error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get unread contact message count (admin)
// @route  GET /api/contact-messages/unread-count
// @access Private (admin)
const getUnreadCount = async (req, res) => {
  try {
    const unread = await ContactMessage.countDocuments({ status: "Unread" });
    res.json({ success: true, unread });
  } catch (error) {
    console.error("Unread count error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update a contact message (admin) - status, readAt, repliedAt
// @route  PUT /api/contact-messages/:id
// @access Private (admin)
const updateMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    const body = req.body || {};
    const next = body.status || message.status;

    message.status = next;
    if (next === "Read" && !message.readAt) message.readAt = new Date();
    if (next === "Replied") {
      if (!message.readAt) message.readAt = new Date();
      message.repliedAt = new Date();
    }
    if (next === "Unread") {
      message.readAt = null;
      message.repliedAt = null;
    }

    await message.save();
    res.json({ success: true, message: "Message updated", contactMessage: message });
  } catch (error) {
    console.error("Update contact message error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete a contact message (admin)
// @route  DELETE /api/contact-messages/:id
// @access Private (admin)
const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Delete contact message error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitMessage,
  listMessages,
  getUnreadCount,
  updateMessage,
  deleteMessage,
};
