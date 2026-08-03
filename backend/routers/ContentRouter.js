const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const {
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
} = require("../controllers/ContentController");

router.get("/bootstrap", getBootstrap);
router.get("/reels/video", getReelVideo);

router.get("/faqs", getPublicFaqs);
router.get("/campaigns", getPublicCampaigns);
router.get("/popups", getPublicPopups);
router.get("/testimonials", getPublicTestimonials);

router.put("/settings", protect, authorize("admin"), upload.any(), updateSettings);
router.put("/homepage", protect, authorize("admin"), upload.any(), updateHomepage);
router.put("/footer", protect, authorize("admin"), upload.any(), updateFooter);
router.put("/social", protect, authorize("admin"), upload.any(), updateSocialLinks);
router.put("/about", protect, authorize("admin"), upload.any(), updateAbout);
router.put("/contact", protect, authorize("admin"), upload.any(), updateContact);

router.get("/announcements/all", protect, authorize("admin"), getAnnouncements);
router.post("/announcements", protect, authorize("admin"), upload.any(), createAnnouncement);
router.put("/announcements/:id", protect, authorize("admin"), upload.any(), updateAnnouncement);
router.delete("/announcements/:id", protect, authorize("admin"), deleteAnnouncement);

router.get("/reels/all", protect, authorize("admin"), getReels);
router.post("/reels", protect, authorize("admin"), upload.any(), createReel);
router.put("/reels/:id", protect, authorize("admin"), upload.any(), updateReel);
router.delete("/reels/:id", protect, authorize("admin"), deleteReel);

router.get("/gallery/all", protect, authorize("admin"), getGallery);
router.post("/gallery", protect, authorize("admin"), upload.any(), createGalleryItem);
router.put("/gallery/:id", protect, authorize("admin"), upload.any(), updateGalleryItem);
router.delete("/gallery/:id", protect, authorize("admin"), deleteGalleryItem);

router.get("/faqs/all", protect, authorize("admin"), getAllFaqs);
router.post("/faqs", protect, authorize("admin"), upload.any(), createFaq);
router.put("/faqs/:id", protect, authorize("admin"), upload.any(), updateFaq);
router.delete("/faqs/:id", protect, authorize("admin"), deleteFaq);

router.get("/campaigns/all", protect, authorize("admin"), getAllCampaigns);
router.post("/campaigns", protect, authorize("admin"), upload.any(), createCampaign);
router.put("/campaigns/:id", protect, authorize("admin"), upload.any(), updateCampaign);
router.delete("/campaigns/:id", protect, authorize("admin"), deleteCampaign);

router.get("/popups/all", protect, authorize("admin"), getAllPopups);
router.post("/popups", protect, authorize("admin"), upload.any(), createPopup);
router.put("/popups/:id", protect, authorize("admin"), upload.any(), updatePopup);
router.delete("/popups/:id", protect, authorize("admin"), deletePopup);

router.get("/testimonials/all", protect, authorize("admin"), getAllTestimonials);
router.post("/testimonials", protect, authorize("admin"), upload.any(), createTestimonial);
router.put("/testimonials/:id", protect, authorize("admin"), upload.any(), updateTestimonial);
router.delete("/testimonials/:id", protect, authorize("admin"), deleteTestimonial);

module.exports = router;
