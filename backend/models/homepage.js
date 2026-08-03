const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    eyebrow: { type: String, default: "Handmade Arts • Crafts • Gifts" },
    heading: { type: String, default: "Handmade with Heart" },
    headingAccent: { type: String, default: "" },
    subheading: { type: String, default: "" },
    buttonText: { type: String, default: "Explore Crafts" },
    buttonLink: { type: String, default: "/shop" },
    secondaryButtonText: { type: String, default: "Create Custom" },
    secondaryButtonLink: { type: String, default: "/custom-orders" },
  },
  { _id: false }
);

const homepageSchema = new mongoose.Schema(
  {
    hero: { type: heroSchema, default: () => ({}) },
    festivalBanner: {
      image: { type: String, default: "" },
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      buttonText: { type: String, default: "" },
      buttonLink: { type: String, default: "/shop" },
      active: { type: Boolean, default: false },
    },
    categoriesTitle: { type: String, default: "Shop by Category" },
    categoriesSubtitle: { type: String, default: "Find your craft." },
    featuredTitle: { type: String, default: "Featured Products" },
    featuredSubtitle: { type: String, default: "Hand-picked favourites." },
    bestSellersTitle: { type: String, default: "Best Sellers" },
    bestSellersSubtitle: { type: String, default: "The most loved handmades." },
    newArrivalsTitle: { type: String, default: "New Arrivals" },
    newArrivalsSubtitle: { type: String, default: "Fresh from the bench." },
    personalizedTitle: { type: String, default: "Personalized Gifts" },
    personalizedSubtitle: { type: String, default: "Made just for them." },
    personalizedImage: { type: String, default: "" },
    personalizedButtonText: { type: String, default: "Start a Custom Order" },
    personalizedButtonLink: { type: String, default: "/custom-orders" },
    reviewsTitle: { type: String, default: "What Customers Say" },
    reviewsSubtitle: { type: String, default: "Real reviews from real craft-lovers." },
    galleryTitle: { type: String, default: "From Our Customers" },
    gallerySubtitle: { type: String, default: "Tag @takenby_crafts to be featured." },
    reelsTitle: { type: String, default: "Watch Us Create" },
    reelsSubtitle: { type: String, default: "Behind the scenes & making process." },
    aboutTitle: { type: String, default: "About TakenBy_Crafts" },
    aboutSubtitle: { type: String, default: "A story of hands and heart." },
    newsletterTitle: { type: String, default: "Join the TakenBy_Crafts Circle" },
    newsletterSubtitle: { type: String, default: "Subscribe for new arrivals and craft updates." },
    stats: [
      {
        value: { type: String, default: "500+" },
        label: { type: String, default: "Handmade Pieces" },
      },
    ],
    showSections: {
      announcements: { type: Boolean, default: true },
      festivalBanner: { type: Boolean, default: true },
      categories: { type: Boolean, default: true },
      featured: { type: Boolean, default: true },
      bestSellers: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: true },
      personalized: { type: Boolean, default: true },
      reels: { type: Boolean, default: true },
      gallery: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Homepage = mongoose.model("Homepage", homepageSchema);
module.exports = Homepage;
