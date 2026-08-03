const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/users");
const Category = require("../models/categories");
const Product = require("../models/products");
const Cart = require("../models/carts");
const Wishlist = require("../models/wishlists");
const Coupon = require("../models/coupons");
const Order = require("../models/orders");
const Review = require("../models/reviews");
const Customization = require("../models/customizations");
const InventoryLog = require("../models/inventorylog");
const Settings = require("../models/settings");
const Homepage = require("../models/homepage");
const Footer = require("../models/footer");
const SocialLinks = require("../models/sociallinks");
const About = require("../models/about");
const Contact = require("../models/contact");
const Announcement = require("../models/announcements");
const Reel = require("../models/reels");
const Gallery = require("../models/gallery");
const EmailOtp = require("../models/emailotp");
const PasswordResetToken = require("../models/passwordreset");

const destroy = process.argv.includes("--destroy");

const palette = [
  "#c77b5a",
  "#a9735b",
  "#b58f7a",
  "#8a9a7b",
  "#c98a8f",
  "#c9a227",
  "#7d8a6f",
  "#d4a373",
  "#b5838d",
  "#9d8189",
];

const svgImage = (label, color, idx) => {
  const bg = color;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="${bg}"/><rect x="20" y="20" width="560" height="560" rx="24" fill="#fff8f0" opacity="0.12"/><text x="300" y="285" font-family="Georgia, serif" font-size="38" fill="#ffffff" text-anchor="middle" font-weight="bold">${label}</text><text x="300" y="335" font-family="Georgia, serif" font-size="20" fill="#fff5e6" text-anchor="middle" opacity="0.9">TakenBy_Crafts • Handmade</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

const categoriesData = [
  { name: "Resin Art", slug: "resin-art", description: "Handcrafted resin art pieces with mesmerizing colours." },
  { name: "Resin Keychains", slug: "resin-keychains", description: "Personalized resin keychains in every colour and theme." },
  { name: "Jewelry", slug: "jewelry", description: "Elegant handmade jewelry crafted with care." },
  { name: "Preserved Flower Jewelry", slug: "preserved-flower-jewelry", description: "Real flowers preserved forever inside jewelry." },
  { name: "Clay Crafts", slug: "clay-crafts", description: "Beautiful air-dry clay art and decorations." },
  { name: "Photo Frames", slug: "photo-frames", description: "Custom photo frames made to hold your memories." },
  { name: "Home Décor", slug: "home-decor", description: "Warm handmade décor for your space." },
  { name: "Personalized Gifts", slug: "personalized-gifts", description: "Gifts made personal with names, initials and messages." },
  { name: "Coasters", slug: "coasters", description: "Resin and flower coasters that protect and beautify." },
  { name: "Handmade Accessories", slug: "handmade-accessories", description: "Everyday accessories made by hand." },
  { name: "Gift Hampers", slug: "gift-hampers", description: "Curated hampers for every occasion." },
  { name: "Custom Orders", slug: "custom-orders", description: "Tell us your idea, we craft it just for you." },
];

const productTemplates = [
  {
    name: "Personalized Resin Keychain",
    category: "Resin Keychains",
    price: 249,
    discount: 10,
    stock: 50,
    materials: "Epoxy resin, glitter, key ring",
    size: "3 x 2 inches",
    preparationTime: "3-5 days",
    customizable: true,
    featured: true,
  },
  {
    name: "Floral Resin Coaster",
    category: "Coasters",
    price: 199,
    discount: 0,
    stock: 40,
    materials: "Epoxy resin, dried flowers",
    size: "4 inches round",
    preparationTime: "4-6 days",
    customizable: true,
    featured: true,
  },
  {
    name: "Preserved Rose Pendant",
    category: "Preserved Flower Jewelry",
    price: 599,
    discount: 15,
    stock: 25,
    materials: "Preserved mini rose, resin, silver chain",
    size: "2 cm pendant",
    preparationTime: "5-7 days",
    customizable: true,
    featured: true,
  },
  {
    name: "Custom Photo Frame",
    category: "Photo Frames",
    price: 499,
    discount: 5,
    stock: 20,
    materials: "MDF, resin, acrylic sheet",
    size: "6 x 4 inches",
    preparationTime: "4-7 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Clay Earrings (Set of 3)",
    category: "Clay Crafts",
    price: 349,
    discount: 10,
    stock: 35,
    materials: "Air-dry clay, hypoallergenic hooks",
    size: "3 cm",
    preparationTime: "3-5 days",
    customizable: false,
    featured: true,
  },
  {
    name: "Handmade Beaded Bracelet",
    category: "Handmade Accessories",
    price: 299,
    discount: 0,
    stock: 45,
    materials: "Glass beads, elastic cord",
    size: "Adjustable",
    preparationTime: "2-4 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Pressed Flower Bookmark",
    category: "Resin Art",
    price: 149,
    discount: 20,
    stock: 60,
    materials: "Real pressed flowers, resin",
    size: "18 x 5 cm",
    preparationTime: "2-3 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Resin Initial Pendant",
    category: "Resin Art",
    price: 449,
    discount: 0,
    stock: 30,
    materials: "Resin, gold foil, chain",
    size: "2.5 cm",
    preparationTime: "4-6 days",
    customizable: true,
    featured: true,
  },
  {
    name: "Custom Birthday Frame",
    category: "Personalized Gifts",
    price: 649,
    discount: 10,
    stock: 18,
    materials: "Resin, photo, decorative charms",
    size: "7 x 5 inches",
    preparationTime: "5-8 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Mini Gift Hamper",
    category: "Gift Hampers",
    price: 999,
    discount: 15,
    stock: 15,
    materials: "Handmade crafts, dried flowers, kraft box",
    size: "Medium box",
    preparationTime: "5-7 days",
    customizable: true,
    featured: true,
  },
  {
    name: "Handmade Wall Décor",
    category: "Home Décor",
    price: 1299,
    discount: 0,
    stock: 12,
    materials: "Wood, resin, jute rope",
    size: "14 inches diameter",
    preparationTime: "7-10 days",
    customizable: false,
    featured: false,
  },
  {
    name: "Couple Keychain Set",
    category: "Resin Keychains",
    price: 349,
    discount: 15,
    stock: 40,
    materials: "Resin, engraved initials, key rings",
    size: "3 x 2 inches each",
    preparationTime: "4-6 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Flower Preservation Frame",
    category: "Home Décor",
    price: 899,
    discount: 5,
    stock: 14,
    materials: "Real dried flowers, glass frame",
    size: "8 x 10 inches",
    preparationTime: "6-9 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Name Bracelet",
    category: "Personalized Gifts",
    price: 399,
    discount: 10,
    stock: 33,
    materials: "Leather cord, metal beads, letter beads",
    size: "Adjustable",
    preparationTime: "3-5 days",
    customizable: true,
    featured: true,
  },
  {
    name: "Personalized Coaster Set (4 pcs)",
    category: "Coasters",
    price: 699,
    discount: 10,
    stock: 22,
    materials: "Resin, dried flowers, personalised text",
    size: "4 inches each",
    preparationTime: "5-8 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Resin Jewelry Tray",
    category: "Home Décor",
    price: 549,
    discount: 0,
    stock: 20,
    materials: "Resin, gold flakes, pearls",
    size: "6 x 4 inches",
    preparationTime: "4-6 days",
    customizable: false,
    featured: false,
  },
  {
    name: "Dried Flower Stud Earrings",
    category: "Preserved Flower Jewelry",
    price: 299,
    discount: 20,
    stock: 38,
    materials: "Dried flowers, resin, surgical steel",
    size: "1.5 cm",
    preparationTime: "3-5 days",
    customizable: false,
    featured: false,
  },
  {
    name: "Custom Couple Photo Frame",
    category: "Photo Frames",
    price: 799,
    discount: 5,
    stock: 16,
    materials: "Resin, photo, dried flowers",
    size: "8 x 6 inches",
    preparationTime: "6-9 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Handmade Painted Mug",
    category: "Clay Crafts",
    price: 449,
    discount: 0,
    stock: 28,
    materials: "Ceramic mug, hand painted glaze",
    size: "350 ml",
    preparationTime: "4-6 days",
    customizable: true,
    featured: false,
  },
  {
    name: "Boho Handmade Jewelry Set",
    category: "Jewelry",
    price: 1099,
    discount: 15,
    stock: 10,
    materials: "Beads, chain, brass findings",
    size: "Set of 3 pieces",
    preparationTime: "5-7 days",
    customizable: false,
    featured: true,
  },
  {
    name: "Resin Art Wall Clock",
    category: "Resin Art",
    price: 1499,
    discount: 10,
    stock: 8,
    materials: "Resin, wood base, clock mechanism",
    size: "12 inches",
    preparationTime: "8-12 days",
    customizable: false,
    featured: false,
  },
  {
    name: "Thank You Gift Hamper",
    category: "Gift Hampers",
    price: 749,
    discount: 5,
    stock: 20,
    materials: "Handmade crafts, candles, kraft box",
    size: "Medium box",
    preparationTime: "4-6 days",
    customizable: true,
    featured: false,
  },
];

const productDescriptions = {
  "Personalized Resin Keychain":
    "A beautiful handmade resin keychain personalised with your name and favourite colours. Each keychain is handcrafted with love, embedded with glitter and flowers of your choice. Perfect for gifting to friends, family or yourself.",
  "Floral Resin Coaster":
    "Handmade resin coaster with real dried flowers sealed inside. Protects your tables while adding a touch of nature to your home. Each coaster is unique and made to order with your chosen flower combination.",
  "Preserved Rose Pendant":
    "A real rose preserved forever inside a clear resin pendant. Paired with an elegant silver chain, this necklace makes a romantic gift. Every pendant is one-of-a-kind, just like your love story.",
  "Custom Photo Frame":
    "Turn your favourite memory into art. We handcraft a custom photo frame with dried flowers, glitter and a personal message. Simply send us your photo and theme, and we do the rest.",
  "Clay Earrings (Set of 3)":
    "Lightweight handmade clay earrings in three beautiful designs. Hand-painted and sealed for a glossy finish. Hypoallergenic hooks make them comfortable for everyday wear.",
  "Handmade Beaded Bracelet":
    "A delicate handmade beaded bracelet that can be personalised with your name or lucky number. Adjustable to any wrist size, perfect for stacking or gifting.",
  "Pressed Flower Bookmark":
    "Real pressed flowers preserved inside a slim resin bookmark. A thoughtful gift for book lovers that keeps your page and your memories safe.",
  "Resin Initial Pendant":
    "A clear resin pendant featuring your initial with gold foil flakes. Comes with a stainless steel chain. Minimal yet elegant, perfect for everyday wear.",
  "Custom Birthday Frame":
    "Celebrate a birthday with a fully custom frame featuring the recipient's photo, name, and a happy birthday message surrounded by handmade resin flowers.",
  "Mini Gift Hamper":
    "A curated mini hamper filled with handmade crafts, dried flowers and a personalised note. Beautifully packed in a kraft box - the perfect surprise for someone special.",
  "Handmade Wall Décor":
    "A statement piece of handmade wall art. Wooden base with resin waves, jute rope for hanging. Adds warmth and character to any wall.",
  "Couple Keychain Set":
    "Two matching keychains engraved with your initials - a pair made to stay together. Each keychain is personalised with your names and favourite colours.",
  "Flower Preservation Frame":
    "Preserve your wedding bouquet or special flowers forever. We press and frame them in a beautiful glass frame with your chosen layout and message.",
  "Name Bracelet":
    "A stylish bracelet spelling out your name or a meaningful word. Made with quality letter beads on a leather cord. A personalised accessory you will love to wear.",
  "Personalized Coaster Set (4 pcs)":
    "A set of four resin coasters personalised with text or initials. Each coaster contains real dried flowers. Great for housewarmings and anniversaries.",
  "Resin Jewelry Tray":
    "A beautiful resin jewellery tray with gold flakes and pearls to organise your favourite pieces. Makes your dressing table look elegant.",
  "Dried Flower Stud Earrings":
    "Delicate stud earrings made from real dried flowers embedded in clear resin. Lightweight, hypoallergenic and absolutely adorable.",
  "Custom Couple Photo Frame":
    "A romantic custom frame for couples - your photo surrounded by resin flowers and a heartfelt message. A gift they will cherish forever.",
  "Handmade Painted Mug":
    "A hand-painted ceramic mug personalised with a name or message. Each mug is painted and glazed by hand, making every one unique.",
  "Boho Handmade Jewelry Set":
    "A complete boho-style jewellery set including necklace, earrings and bracelet. Handcrafted with quality beads and brass findings.",
  "Resin Art Wall Clock":
    "A functional piece of art - a resin wall clock with flowing colours. Handmade in our studio, it keeps time beautifully.",
  "Thank You Gift Hamper":
    "Show your gratitude with a thoughtfully curated hamper of handmade goodies. Includes candles, crafts and a personalised thank you note.",
};

const productShortDescriptions = {
  "Personalized Resin Keychain": "Handmade resin keychain personalised with your name and colours.",
  "Floral Resin Coaster": "Real dried flowers sealed inside a handmade resin coaster.",
  "Preserved Rose Pendant": "A real rose preserved forever inside a resin pendant.",
  "Custom Photo Frame": "Turn your favourite memory into a handmade frame.",
  "Clay Earrings (Set of 3)": "Lightweight handmade clay earrings, hand-painted and sealed.",
  "Handmade Beaded Bracelet": "A delicate beaded bracelet, personalised to order.",
  "Pressed Flower Bookmark": "Real pressed flowers in a slim resin bookmark.",
  "Resin Initial Pendant": "Clear resin pendant with your initial and gold foil.",
  "Custom Birthday Frame": "A fully custom frame for birthdays with resin flowers.",
  "Mini Gift Hamper": "A curated hamper of handmade crafts and treats.",
  "Handmade Wall Décor": "Statement wall art with a wooden base and resin waves.",
  "Couple Keychain Set": "Two matching personalised keychains made to stay together.",
  "Flower Preservation Frame": "Preserve your special flowers forever in a glass frame.",
  "Name Bracelet": "A bracelet spelling out your name or a meaningful word.",
  "Personalized Coaster Set (4 pcs)": "Four resin coasters personalised with initials or text.",
  "Resin Jewelry Tray": "Elegant resin tray with gold flakes to organise your pieces.",
  "Dried Flower Stud Earrings": "Real dried flowers in clear resin studs.",
  "Custom Couple Photo Frame": "Your photo framed with resin flowers and a message.",
  "Handmade Painted Mug": "A hand-painted ceramic mug, personalised with a name.",
  "Boho Handmade Jewelry Set": "A complete boho set — necklace, earrings and bracelet.",
  "Resin Art Wall Clock": "A functional resin wall clock with flowing colours.",
  "Thank You Gift Hamper": "A thoughtful hamper of handmade goodies and a note.",
};

const seed = async () => {
  try {
    await connectDB();

    if (destroy) {
      console.log("Destroying existing data...");
      await Promise.all([
        User.deleteMany(),
        Category.deleteMany(),
        Product.deleteMany(),
        Cart.deleteMany(),
        Wishlist.deleteMany(),
        Coupon.deleteMany(),
        Order.deleteMany(),
        Review.deleteMany(),
        Customization.deleteMany(),
        InventoryLog.deleteMany(),
        Settings.deleteMany(),
        Homepage.deleteMany(),
        Footer.deleteMany(),
        SocialLinks.deleteMany(),
        About.deleteMany(),
        Contact.deleteMany(),
        Announcement.deleteMany(),
        Reel.deleteMany(),
        Gallery.deleteMany(),
        EmailOtp.deleteMany(),
        PasswordResetToken.deleteMany(),
      ]);
      console.log("All data destroyed.");
      process.exit(0);
    }

    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log("Data already exists. Skipping seed. Use --destroy to reset.");
      process.exit(0);
    }

    console.log("Seeding TakenBy_Crafts (Craftora)...");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@craftora.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Craftora@123";
    const adminName = adminEmail.split("@")[0];
    const adminParts = adminName.split(/[._-]/);

    const [admin, customer1, customer2] = await User.create([
      {
        firstName: adminParts[0] ? adminParts[0][0].toUpperCase() + adminParts[0].slice(1) : "Craftora",
        lastName: adminParts[1] ? adminParts[1][0].toUpperCase() + adminParts[1].slice(1) : "Admin",
        email: adminEmail.toLowerCase(),
        phone: "9876543210",
        password: adminPassword,
        role: "admin",
        isApproved: true,
        address: { street: "Craft Studio, Craft Lane", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
      },
      {
        firstName: "Priya",
        lastName: "Nair",
        email: "customer@craftora.com",
        phone: "9876543213",
        password: "customer123",
        role: "customer",
        isApproved: true,
        address: { street: "Rose Villa", city: "Kochi", state: "Kerala", pincode: "682001" },
      },
      {
        firstName: "Arjun",
        lastName: "Mehta",
        email: "customer2@craftora.com",
        phone: "9876543214",
        password: "customer123",
        role: "customer",
        isApproved: true,
        address: { street: "Lake View", city: "Bangalore", state: "Karnataka", pincode: "560001" },
      },
    ]);

    await Cart.insertMany([
      { user: customer1._id, items: [] },
      { user: customer2._id, items: [] },
    ]);
    await Wishlist.insertMany([
      { user: customer1._id, items: [] },
      { user: customer2._id, items: [] },
    ]);

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    const products = [];
    productTemplates.forEach((t, idx) => {
      const color = palette[idx % palette.length];
      const isNew = idx >= productTemplates.length - 6;
      products.push({
        name: t.name,
        shortDescription:
          (productShortDescriptions[t.name] || "") ||
          "Handmade with love by TakenBy_Crafts. Each piece is unique and made to order.",
        description:
          productDescriptions[t.name] ||
          "A beautiful handmade creation crafted with love by our artisans. Each piece is unique and made to order.",
        category: catMap[t.category],
        sku: `TBC-${1000 + idx}`,
        price: t.price,
        discount: t.discount,
        stock: t.stock,
        lowStockThreshold: t.stock <= 12 ? 3 : 5,
        images: [svgImage(t.name, color, idx), svgImage(t.name + " (detail)", color, idx + 1)],
        coverImage: "",
        materials: t.materials,
        colors: t.colors || "As shown / customisable",
        size: t.size,
        preparationTime: t.preparationTime,
        customizable: t.customizable,
        isPersonalized: t.customizable,
        featured: t.featured,
        isBestSeller: idx % 4 === 0,
        isNewArrival: isNew,
        isActive: true,
        isArchived: false,
        viewCount: 40 + (idx * 37) % 500,
        averageRating: [4.2, 4.5, 4.8, 4.3, 4.6, 4.1][idx % 6],
        reviewCount: [6, 12, 18, 9, 15, 5][idx % 6],
        salesCount: [25, 60, 95, 40, 70, 15][idx % 6],
      });
    });

    await Product.insertMany(products);

    await Coupon.insertMany([
      {
        code: "CRAFT10",
        description: "10% off on orders above ₹499",
        discountType: "percentage",
        discountValue: 10,
        minOrder: 499,
        maxDiscount: 150,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: true,
      },
      {
        code: "WELCOME20",
        description: "Flat ₹100 off for new customers on orders above ₹999",
        discountType: "flat",
        discountValue: 100,
        minOrder: 999,
        maxDiscount: 100,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "FESTIVE15",
        description: "15% off festival special on orders above ₹799",
        discountType: "percentage",
        discountValue: 15,
        minOrder: 799,
        maxDiscount: 250,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        isActive: true,
      },
    ]);

    // ---- Site content defaults ----
    await Settings.create({
      websiteName: "TakenBy_Crafts",
      tagline: "Handmade Arts & Crafts by TakenBy_Crafts",
      logo: "",
      favicon: "",
      primaryColor: "#c77b5a",
      accentColor: "#8a9a7b",
      font: "Playfair Display + Jost",
      phone: "+91 98765 43210",
      whatsapp: "919876543210",
      email: "hello@takenbycrafts.com",
      instagramUsername: "takenby_crafts",
      address: {
        street: "Craft Studio, Craft Lane",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
      },
      mapsEmbed: "",
      deliveryCharges: 40,
      freeDeliveryLimit: 999,
      upiId: "takenbycrafts@upi",
      upiName: "TakenBy_Crafts",
      qrCode: "",
      businessHours: "Mon–Sat, 10:00 AM – 7:00 PM",
      ownerName: "Chandrika",
      about:
        "TakenBy_Crafts is a small handmade craft studio creating personalised resin art, preserved flower jewellery, custom photo frames and gift hampers — each piece crafted with heart.",
      copyrightText: "All rights reserved.",
    });

    await Homepage.create({
      hero: {
        image: "",
        eyebrow: "Handmade Arts • Crafts • Gifts",
        heading: "Handmade with Heart",
        headingAccent: "",
        subheading:
          "Discover unique resin art, personalized gifts, preserved flower jewelry and décor — each piece crafted with love by TakenBy_Crafts.",
        buttonText: "Explore Crafts",
        buttonLink: "/shop",
        secondaryButtonText: "Create Custom",
        secondaryButtonLink: "/custom-orders",
      },
      festivalBanner: {
        image: "",
        title: "Festive Season Offers",
        subtitle: "Use code FESTIVE15 for 15% off on all handmade gifts.",
        buttonText: "Shop Offers",
        buttonLink: "/shop",
        active: false,
      },
      categoriesTitle: "Shop by Category",
      categoriesSubtitle: "From resin keychains to gift hampers — find your craft.",
      featuredTitle: "Featured Products",
      featuredSubtitle: "Hand-picked favourites our customers love the most.",
      bestSellersTitle: "Best Sellers",
      bestSellersSubtitle: "The most loved handmades of the season.",
      newArrivalsTitle: "New Arrivals",
      newArrivalsSubtitle: "Fresh from the artisan's bench — just dropped.",
      personalizedTitle: "Personalized Gifts, Made Just for Them",
      personalizedSubtitle:
        "Add a name, a date, a memory. Our artisans craft one-of-a-kind keepsakes that tell a story only you know.",
      personalizedImage: "",
      personalizedButtonText: "Start a Custom Order",
      personalizedButtonLink: "/custom-orders",
      reviewsTitle: "What Customers Say",
      reviewsSubtitle: "Real reviews from real craft-lovers.",
      galleryTitle: "From Our Customers",
      gallerySubtitle: "Tag @takenby_crafts to be featured.",
      reelsTitle: "Watch Us Create",
      reelsSubtitle: "Behind the scenes, making process and new collections.",
      aboutTitle: "About TakenBy_Crafts",
      aboutSubtitle: "A small handmade studio with a big heart.",
      newsletterTitle: "Join the TakenBy_Crafts Circle",
      newsletterSubtitle: "Subscribe for new arrivals, artisan stories and exclusive craft coupons.",
      stats: [
        { value: "500+", label: "Handmade Pieces" },
        { value: "4.8★", label: "Avg. Rating" },
        { value: "1000+", label: "Happy Customers" },
        { value: "7 days", label: "Avg. Delivery" },
      ],
    });

    await Footer.create({
      aboutText:
        "Handmade arts, crafts, personalised gifts and décor — crafted with heart by TakenBy_Crafts, delivered to your doorstep.",
      quickLinks: [
        { label: "Shop All", url: "/shop" },
        { label: "Categories", url: "/categories" },
        { label: "Custom Orders", url: "/custom-orders" },
        { label: "About Us", url: "/about" },
        { label: "Contact", url: "/contact" },
      ],
      customerCareLinks: [
        { label: "Track Order", url: "/orders" },
        { label: "Cart", url: "/cart" },
        { label: "Wishlist", url: "/wishlist" },
        { label: "My Account", url: "/account" },
        { label: "Custom Order Status", url: "/custom-orders/my" },
      ],
      policyLinks: [
        { label: "Privacy Policy", url: "/privacy-policy" },
        { label: "Terms & Conditions", url: "/terms" },
        { label: "Return Policy", url: "/return-policy" },
        { label: "FAQ", url: "/faq" },
      ],
      showSocial: true,
    });

    await SocialLinks.create({
      instagram: "https://www.instagram.com/takenby_crafts",
      whatsapp: "https://wa.me/919876543210",
      youtube: "",
      facebook: "",
      pinterest: "",
      maps: "",
      website: "",
    });

    await Contact.create({
      heading: "Contact Us",
      subtitle: "Questions, custom ideas or collaboration? We'd love to hear from you.",
      address: {
        street: "Craft Studio, Craft Lane",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
      },
      phone: "+91 98765 43210",
      whatsapp: "919876543210",
      email: "hello@takenbycrafts.com",
      instagram: "https://www.instagram.com/takenby_crafts",
      mapsEmbed: "",
      mapsLink: "",
      hours: "Mon–Sat, 10:00 AM – 7:00 PM",
    });

    await About.create({
      story:
        "TakenBy_Crafts was born from a simple belief — that the things we keep should carry meaning, warmth and a human touch. What began as a small hobby of pouring resin at a kitchen table has grown into a beloved handmade craft studio crafting personalised keychains, preserved flower jewellery, custom photo frames and gift hampers.",
      mission:
        "To create handmade keepsakes that preserve your most precious memories — beautifully crafted, honestly priced and delivered with love.",
      vision:
        "To become India's most loved small-batch handmade craft studio, where every order tells a story and every customer feels like family.",
      journey:
        "From a single table to a full crafting studio, every piece we make carries the same love as the very first one. We have crafted for weddings, birthdays, anniversaries, farewells and every small moment in between.",
      achievements: [
        "1000+ handmade orders delivered across India",
        "Trusted by couples for wedding return gifts",
        "Featured in local craft exhibitions and pop-up stalls",
      ],
      certificates: [],
      galleryImages: [],
      workshopImages: [],
      stallPhotos: [],
    });

    await Announcement.create({
      title: "Welcome to TakenBy_Crafts 🎨",
      description:
        "We are a small handmade studio. Every order is crafted just for you, so please allow 3–7 days for preparation.",
      priority: 10,
      pinned: true,
      published: true,
      type: "general",
    });

    await Reel.create({
      url: "",
      title: "Behind the Scenes",
      description: "Watch how our resin pieces are made.",
      featured: true,
      order: 0,
      active: true,
    });

    console.log("✓ Seed complete!");
    console.log("------------------------------------");
    console.log("Admin account created from ADMIN_EMAIL / ADMIN_PASSWORD env.");
    console.log(`Admin email: ${adminEmail.toLowerCase()}`);
    console.log("Customer: customer@craftora.com / customer123");
    console.log("Customer2: customer2@craftora.com / customer123");
    console.log("Coupons:  CRAFT10, WELCOME20, FESTIVE15");
    console.log("------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
