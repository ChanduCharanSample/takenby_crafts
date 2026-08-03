const Settings = require("../models/settings");
const Homepage = require("../models/homepage");
const Footer = require("../models/footer");
const SocialLinks = require("../models/sociallinks");
const About = require("../models/about");
const Contact = require("../models/contact");
const Announcement = require("../models/announcements");
const Reel = require("../models/reels");
const Gallery = require("../models/gallery");
const Review = require("../models/reviews");
const Faq = require("../models/faqs");
const FestivalCampaign = require("../models/festivalcampaigns");
const Popup = require("../models/popups");
const Testimonial = require("../models/testimonials");
const { storeFile } = require("../services/imageStorage");

const getDoc = async (Model, defaults = {}) => {
  let doc = await Model.findOne().sort({ createdAt: 1 });
  if (!doc) doc = await Model.create(defaults);
  return doc;
};

// @desc   Get all public site content in one call
// @route  GET /api/content/bootstrap
// @access Public
const getBootstrap = async (req, res) => {
  try {
    const now = new Date();
    const [
      settings,
      homepage,
      footer,
      social,
      about,
      contact,
      announcements,
      reels,
      gallery,
      featuredReviews,
      latestReviews,
      faqs,
      activeCampaigns,
      activePopups,
      featuredTestimonials,
    ] = await Promise.all([
      getDoc(Settings),
      getDoc(Homepage),
      getDoc(Footer),
      getDoc(SocialLinks),
      getDoc(About),
      getDoc(Contact),
      Announcement.find({
        published: true,
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      }).sort({ pinned: -1, priority: -1, createdAt: -1 }),
      Reel.find({ active: true }).sort({ featured: -1, order: 1, createdAt: -1 }),
      Gallery.find({ active: true }).sort({ order: 1, createdAt: -1 }),
      Review.find({ featured: true })
        .populate("user", "firstName lastName")
        .populate("product", "name images")
        .sort({ createdAt: -1 })
        .limit(6),
      Review.find()
        .populate("user", "firstName lastName")
        .populate("product", "name images")
        .sort({ createdAt: -1 })
        .limit(8),
      Faq.find({ status: "published" }).sort({ order: 1, createdAt: 1 }),
      FestivalCampaign.find({
        enabled: true,
        startDate: { $lte: now },
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      }).sort({ startDate: -1, createdAt: -1 }),
      Popup.find({ enabled: true, display: { $ne: "disabled" } }).sort({ createdAt: -1 }),
      Testimonial.find({ featured: true, status: "published" }).sort({
        order: 1,
        createdAt: -1,
      }),
    ]);

    res.json({
      success: true,
      data: {
        settings,
        homepage,
        footer,
        social,
        about,
        contact,
        announcements,
        reels,
        gallery,
        featuredReviews,
        latestReviews,
        faqs,
        activeCampaigns,
        activePopups,
        featuredTestimonials,
      },
    });
  } catch (error) {
    console.error("Bootstrap error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Admin: settings ----
const updateSettings = async (req, res) => {
  try {
    const settings = await getDoc(Settings);
    const body = JSON.parse(req.body.data || "{}");
    const fields = [
      "websiteName",
      "tagline",
      "logo",
      "favicon",
      "primaryColor",
      "accentColor",
      "font",
      "phone",
      "whatsapp",
      "email",
      "instagramUsername",
      "address",
      "mapsEmbed",
      "deliveryCharges",
      "freeDeliveryLimit",
      "upiId",
      "upiName",
      "qrCode",
      "businessHours",
      "ownerName",
      "about",
      "copyrightText",
    ];
    fields.forEach((f) => {
      if (body[f] !== undefined) settings[f] = body[f];
    });
    if (req.files) {
      for (const file of req.files) {
        if (file.fieldname === "logo") settings.logo = await storeFile(file);
        if (file.fieldname === "favicon") settings.favicon = await storeFile(file);
        if (file.fieldname === "qrCode") settings.qrCode = await storeFile(file);
      }
    }
    await settings.save();
    res.json({ success: true, message: "Settings updated", settings });
  } catch (error) {
    console.error("Update settings error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Admin: homepage ----
const updateHomepage = async (req, res) => {
  try {
    const homepage = await getDoc(Homepage);
    const body = JSON.parse(req.body.data || "{}");

    const allowed = [
      "festivalBanner",
      "categoriesTitle",
      "categoriesSubtitle",
      "featuredTitle",
      "featuredSubtitle",
      "bestSellersTitle",
      "bestSellersSubtitle",
      "newArrivalsTitle",
      "newArrivalsSubtitle",
      "personalizedTitle",
      "personalizedSubtitle",
      "personalizedImage",
      "personalizedButtonText",
      "personalizedButtonLink",
      "reviewsTitle",
      "reviewsSubtitle",
      "galleryTitle",
      "gallerySubtitle",
      "reelsTitle",
      "reelsSubtitle",
      "aboutTitle",
      "aboutSubtitle",
      "newsletterTitle",
      "newsletterSubtitle",
      "stats",
      "showSections",
    ];
    allowed.forEach((f) => {
      if (body[f] !== undefined) homepage[f] = body[f];
    });

    if (body.hero && typeof body.hero === "object") {
      homepage.hero = { ...homepage.hero.toObject ? homepage.hero.toObject() : homepage.hero, ...body.hero };
    }
    if (req.files) {
      for (const file of req.files) {
        if (file.fieldname === "heroImage") homepage.hero.image = await storeFile(file);
        if (file.fieldname === "festivalImage") homepage.festivalBanner.image = await storeFile(file);
        if (file.fieldname === "personalizedImage") homepage.personalizedImage = await storeFile(file);
      }
    }
    await homepage.save();
    res.json({ success: true, message: "Homepage updated", homepage });
  } catch (error) {
    console.error("Update homepage error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Admin: footer ----
const updateFooter = async (req, res) => {
  try {
    const footer = await getDoc(Footer);
    const body = JSON.parse(req.body.data || "{}");
    ["aboutText", "quickLinks", "customerCareLinks", "policyLinks", "showSocial"].forEach((f) => {
      if (body[f] !== undefined) footer[f] = body[f];
    });
    await footer.save();
    res.json({ success: true, message: "Footer updated", footer });
  } catch (error) {
    console.error("Update footer error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Admin: social links ----
const updateSocialLinks = async (req, res) => {
  try {
    const social = await getDoc(SocialLinks);
    const body = JSON.parse(req.body.data || "{}");
    ["instagram", "whatsapp", "youtube", "facebook", "pinterest", "maps", "website"].forEach((f) => {
      if (body[f] !== undefined) social[f] = body[f];
    });
    await social.save();
    res.json({ success: true, message: "Social links updated", social });
  } catch (error) {
    console.error("Update social error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Admin: about ----
const updateAbout = async (req, res) => {
  try {
    const about = await getDoc(About);
    const body = JSON.parse(req.body.data || "{}");
    ["story", "mission", "vision", "journey", "achievements", "certificates"].forEach((f) => {
      if (body[f] !== undefined) about[f] = body[f];
    });
    if (req.files) {
      for (const file of req.files) {
        if (file.fieldname === "galleryImages") about.galleryImages.push(await storeFile(file));
        if (file.fieldname === "workshopImages") about.workshopImages.push(await storeFile(file));
        if (file.fieldname === "stallPhotos") about.stallPhotos.push(await storeFile(file));
      }
    }
    if (body.removeGalleryImages) {
      about.galleryImages = about.galleryImages.filter((i) => !body.removeGalleryImages.includes(i));
    }
    if (body.removeWorkshopImages) {
      about.workshopImages = about.workshopImages.filter((i) => !body.removeWorkshopImages.includes(i));
    }
    if (body.removeStallPhotos) {
      about.stallPhotos = about.stallPhotos.filter((i) => !body.removeStallPhotos.includes(i));
    }
    await about.save();
    res.json({ success: true, message: "About page updated", about });
  } catch (error) {
    console.error("Update about error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Admin: contact ----
const updateContact = async (req, res) => {
  try {
    const contact = await getDoc(Contact);
    const body = JSON.parse(req.body.data || "{}");
    ["heading", "subtitle", "address", "phone", "whatsapp", "email", "instagram", "mapsEmbed", "mapsLink", "hours"].forEach((f) => {
      if (body[f] !== undefined) contact[f] = body[f];
    });
    await contact.save();
    res.json({ success: true, message: "Contact page updated", contact });
  } catch (error) {
    console.error("Update contact error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Announcements ----
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ pinned: -1, priority: -1, createdAt: -1 });
    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const body = JSON.parse(req.body.data || "{}");
    if (!body.title) return res.status(400).json({ success: false, message: "Title is required" });
    if (req.files && req.files[0]) body.image = await storeFile(req.files[0]);
    const announcement = await Announcement.create(body);
    res.status(201).json({ success: true, message: "Announcement created", announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Not found" });
    const body = JSON.parse(req.body.data || "{}");
    ["title", "description", "image", "videoLink", "reelLink", "priority", "startDate", "endDate", "published", "pinned", "type"].forEach((f) => {
      if (body[f] !== undefined) announcement[f] = body[f];
    });
    if (req.files && req.files[0]) announcement.image = await storeFile(req.files[0]);
    await announcement.save();
    res.json({ success: true, message: "Announcement updated", announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Reels ----
const getReels = async (req, res) => {
  try {
    const reels = await Reel.find().sort({ featured: -1, order: 1, createdAt: -1 });
    res.json({ success: true, count: reels.length, reels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createReel = async (req, res) => {
  try {
    const body = JSON.parse(req.body.data || "{}");
    if (!body.url) return res.status(400).json({ success: false, message: "Reel URL is required" });
    const reel = await Reel.create(body);
    res.status(201).json({ success: true, message: "Reel created", reel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ success: false, message: "Not found" });
    const body = JSON.parse(req.body.data || "{}");
    ["url", "title", "description", "thumbnail", "featured", "order", "active"].forEach((f) => {
      if (body[f] !== undefined) reel[f] = body[f];
    });
    await reel.save();
    res.json({ success: true, message: "Reel updated", reel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReel = async (req, res) => {
  try {
    await Reel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Reel deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Gallery ----
const getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: gallery.length, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const body = JSON.parse(req.body.data || "{}");
    if (!req.files || !req.files[0]) return res.status(400).json({ success: false, message: "Image is required" });
    const item = await Gallery.create({ image: await storeFile(req.files[0]), caption: body.caption || "", active: body.active !== "false", order: Number(body.order) || 0 });
    res.status(201).json({ success: true, message: "Gallery item added", item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    const body = JSON.parse(req.body.data || "{}");
    if (body.caption !== undefined) item.caption = body.caption;
    if (body.order !== undefined) item.order = Number(body.order) || 0;
    if (body.active !== undefined) item.active = body.active === "true" || body.active === true;
    if (req.files && req.files[0]) item.image = await storeFile(req.files[0]);
    await item.save();
    res.json({ success: true, message: "Gallery item updated", item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Gallery item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get direct playable MP4 URL for an Instagram reel/post
// @route  GET /api/content/reels/video
// @access Public
const getReelVideo = async (req, res) => {
  const url = req.query.url;
  const m = (url || "").match(/reel[s]?\/([A-Za-z0-9_-]+)/) || (url || "").match(/p\/([A-Za-z0-9_-]+)/);
  const code = m ? m[1] : "";
  if (!code) return res.status(400).json({ success: false, message: "Invalid Instagram URL" });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(`https://www.instagram.com/reel/${code}/`, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);
    const html = await resp.text();

    const videoMatch = html.match(/"url":"(https:[^"]+?\.mp4[^"]*)"/);
    if (!videoMatch) {
      return res.status(404).json({ success: false, message: "Could not find the reel video." });
    }

    const videoUrl = videoMatch[1]
      .replace(/\\u0026/g, "&")
      .replace(/\\\//g, "/");
    return res.json({ success: true, videoUrl });
  } catch (error) {
    console.error("Reel video error:", error.message);
    res.status(500).json({ success: false, message: "Could not load the reel video." });
  }
};

// ---- FAQs ----
const getPublicFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ status: "published" }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFaq = async (req, res) => {
  try {
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (!body.question || !body.answer) {
      return res.status(400).json({ success: false, message: "Question and answer are required" });
    }
    const faq = await Faq.create({
      question: body.question,
      answer: body.answer,
      category: body.category || "general",
      order: Number(body.order) || 0,
      status: body.status || "published",
    });
    res.status(201).json({ success: true, message: "FAQ created", faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "Not found" });
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (body.question !== undefined) faq.question = body.question;
    if (body.answer !== undefined) faq.answer = body.answer;
    if (body.category !== undefined) faq.category = body.category;
    if (body.order !== undefined) faq.order = Number(body.order) || 0;
    if (body.status !== undefined) faq.status = body.status;
    await faq.save();
    res.json({ success: true, message: "FAQ updated", faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFaq = async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Festival / Offer Campaigns ----
const getPublicCampaigns = async (req, res) => {
  try {
    const now = new Date();
    const campaigns = await FestivalCampaign.find({
      enabled: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    }).sort({ startDate: -1, createdAt: -1 });
    res.json({ success: true, count: campaigns.length, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await FestivalCampaign.find().sort({ createdAt: -1 });
    res.json({ success: true, count: campaigns.length, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCampaign = async (req, res) => {
  try {
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (!body.name) {
      return res.status(400).json({ success: false, message: "Campaign name is required" });
    }
    if (req.files && req.files[0]) body.banner = await storeFile(req.files[0]);
    const campaign = await FestivalCampaign.create(body);
    res.status(201).json({ success: true, message: "Campaign created", campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const campaign = await FestivalCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Not found" });
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    ["name", "banner", "description", "offerText", "couponCode", "buttonText", "buttonUrl", "startDate", "endDate", "enabled"].forEach((f) => {
      if (body[f] !== undefined) campaign[f] = body[f];
    });
    if (req.files && req.files[0]) campaign.banner = await storeFile(req.files[0]);
    await campaign.save();
    res.json({ success: true, message: "Campaign updated", campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    await FestivalCampaign.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Popups ----
const getPublicPopups = async (req, res) => {
  try {
    const popups = await Popup.find({ enabled: true, display: { $ne: "disabled" } }).sort({ createdAt: -1 });
    res.json({ success: true, count: popups.length, popups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPopups = async (req, res) => {
  try {
    const popups = await Popup.find().sort({ createdAt: -1 });
    res.json({ success: true, count: popups.length, popups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPopup = async (req, res) => {
  try {
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (req.files && req.files[0]) body.image = await storeFile(req.files[0]);
    const popup = await Popup.create(body);
    res.status(201).json({ success: true, message: "Popup created", popup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePopup = async (req, res) => {
  try {
    const popup = await Popup.findById(req.params.id);
    if (!popup) return res.status(404).json({ success: false, message: "Not found" });
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    ["title", "description", "image", "buttonText", "buttonUrl", "enabled", "display"].forEach((f) => {
      if (body[f] !== undefined) popup[f] = body[f];
    });
    if (req.files && req.files[0]) popup.image = await storeFile(req.files[0]);
    await popup.save();
    res.json({ success: true, message: "Popup updated", popup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePopup = async (req, res) => {
  try {
    await Popup.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Popup deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Testimonials ----
const getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ featured: true, status: "published" }).sort({
      order: 1,
      createdAt: -1,
    });
    res.json({ success: true, count: testimonials.length, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: testimonials.length, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (!body.name || !body.comment) {
      return res.status(400).json({ success: false, message: "Name and review are required" });
    }
    if (req.files && req.files[0]) body.photo = await storeFile(req.files[0]);
    const testimonial = await Testimonial.create({
      name: body.name,
      photo: body.photo || "",
      role: body.role || "Verified Customer",
      comment: body.comment,
      rating: Number(body.rating) || 5,
      featured: body.featured === undefined ? true : body.featured,
      order: Number(body.order) || 0,
      status: body.status || "published",
      sourceReview: body.sourceReview || null,
    });
    res.status(201).json({ success: true, message: "Testimonial created", testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: "Not found" });
    const body = req.body.data ? JSON.parse(req.body.data) : req.body;
    ["name", "photo", "role", "comment", "rating", "featured", "order", "status", "sourceReview"].forEach((f) => {
      if (body[f] !== undefined) testimonial[f] = body[f];
    });
    if (req.files && req.files[0]) testimonial.photo = await storeFile(req.files[0]);
    await testimonial.save();
    res.json({ success: true, message: "Testimonial updated", testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBootstrap,
  updateSettings,
  updateHomepage,
  updateFooter,
  updateSocialLinks,
  updateAbout,
  updateContact,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getReels,
  createReel,
  updateReel,
  deleteReel,
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getReelVideo,
  getPublicFaqs,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getPublicCampaigns,
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getPublicPopups,
  getAllPopups,
  createPopup,
  updatePopup,
  deletePopup,
  getPublicTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
