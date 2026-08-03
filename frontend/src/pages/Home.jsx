import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaGift,
  FaHeart,
  FaPalette,
  FaTruck,
  FaShieldAlt,
  FaLeaf,
  FaInstagram,
  FaArrowRight,
  FaWhatsapp,
} from "react-icons/fa";
import { productService } from "../services";
import { useContent } from "../context/ContentContext";
import { getImageUrl } from "../utils/helpers";
import ProductSection from "../components/ProductSection";
import ProductCard from "../components/ProductCard";
import RatingStars from "../components/RatingStars";
import InstagramReel from "../components/InstagramReel";
import Spinner from "../components/Spinner";

const Home = () => {
  const {
    settings,
    homepage,
    social,
    contact,
    about,
    announcements,
    reels,
    gallery,
    featuredReviews,
    latestReviews,
    featuredTestimonials,
    activeCampaigns,
  } = useContent();

  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const hero = homepage?.hero || {};
  const festival = homepage?.festivalBanner || {};
  const show = homepage?.showSections || {};

  useEffect(() => {
    productService
      .getProducts({ sort: "best-selling", limit: 8 })
      .then(({ data }) => setBestSellers(data.products || []));
    productService
      .getProducts({ sort: "newest", limit: 8 })
      .then(({ data }) => setNewArrivals(data.products || []));
    productService
      .getProducts({ customizable: "true", limit: 8 })
      .then(({ data }) => setPersonalized(data.products || []));
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    setNewsletterMsg("Thank you for subscribing! Stay tuned for crafty updates. 💌");
    e.target.reset();
    setTimeout(() => setNewsletterMsg(""), 4000);
  };

  const whatsappNumber = settings?.whatsapp || social?.whatsapp?.replace("https://wa.me/", "") || "919876543210";
  const waLink = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
  const instagramUrl = social?.instagram || `https://www.instagram.com/${settings?.instagramUsername || ""}`;

  const activeAnnouncements = announcements.filter((a) => a.published);
  const galleryImages = gallery.filter((g) => g.active);
  const reviews = featuredReviews.length ? featuredReviews : latestReviews;
  const testimonials = featuredTestimonials;

  if (!homepage) return <Spinner />;

  return (
    <>
      {/* HERO */}
      <section
        className="hero"
        style={hero.image ? { backgroundImage: `url(${getImageUrl(hero.image)})` } : {}}
      >
        <div className="hero-content">
          {hero.eyebrow && <span className="hero-eyebrow">{hero.eyebrow}</span>}
          <h1 className="hero-title">
            {hero.heading || "Handmade with Heart"}{" "}
            {hero.headingAccent && <span className="hero-accent">{hero.headingAccent}</span>}
          </h1>
          {hero.subheading && <p className="hero-subtitle">{hero.subheading}</p>}
          <div className="hero-actions">
            {hero.buttonText && hero.buttonLink && (
              <Link to={hero.buttonLink} className="btn btn-primary btn-lg">
                {hero.buttonText}
              </Link>
            )}
            {hero.secondaryButtonText && hero.secondaryButtonLink && (
              <Link to={hero.secondaryButtonLink} className="btn btn-outline-light btn-lg">
                {hero.secondaryButtonText}
              </Link>
            )}
          </div>
          {homepage.stats && homepage.stats.length > 0 && (
            <div className="hero-stats">
              {homepage.stats.map((s, i) => (
                <div className="stat" key={i}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      {show.announcements !== false && activeAnnouncements.length > 0 && (
        <section className="announcement-section">
          <div className="container">
            <div className="announcement-strip">
              {activeAnnouncements.slice(0, 3).map((a) => (
                <div className="announcement-chip" key={a._id}>
                  <span className="announcement-title">{a.title}</span>
                  {a.description && <span className="announcement-desc">{a.description}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FESTIVAL BANNER */}
      {show.festivalBanner !== false && festival.active && (
        <section className="festival-banner" style={festival.image ? { backgroundImage: `url(${getImageUrl(festival.image)})` } : {}}>
          <div className="container festival-inner">
            <h2>{festival.title}</h2>
            <p>{festival.subtitle}</p>
            {festival.buttonText && festival.buttonLink && (
              <Link to={festival.buttonLink} className="btn btn-primary btn-lg">
                {festival.buttonText}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* FESTIVAL & OFFER CAMPAIGNS */}
      {activeCampaigns.length > 0 && (
        <section className="campaign-section">
          <div className="container">
            {activeCampaigns.slice(0, 3).map((c) => (
              <div className={`campaign-banner ${c.banner ? "has-bg" : ""}`} key={c._id} style={c.banner ? { backgroundImage: `url(${getImageUrl(c.banner)})` } : {}}>
                <div className="campaign-inner">
                  <div className="campaign-text">
                    <span className="campaign-tag">✦ Offer</span>
                    <h3>{c.name}</h3>
                    {c.description && <p>{c.description}</p>}
                    {c.offerText && <p className="campaign-offer">{c.offerText}</p>}
                    {c.couponCode && (
                      <p className="campaign-coupon">
                        Use code <strong>{c.couponCode}</strong> at checkout
                      </p>
                    )}
                  </div>
                  {(c.buttonText || c.buttonUrl) && (
                    <Link
                      to={c.buttonUrl || "/shop"}
                      className="btn btn-primary btn-lg"
                    >
                      {c.buttonText || "Shop Now"}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SHOP BY CATEGORY */}
      {show.categories !== false && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{homepage.categoriesTitle || "Shop by Category"}</h2>
              {homepage.categoriesSubtitle && (
                <p className="section-subtitle">{homepage.categoriesSubtitle}</p>
              )}
            </div>
            {loadingCategories ? (
              <Spinner />
            ) : (
              <div className="category-grid">
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    to={`/category/${cat.slug}`}
                    key={cat._id}
                    className="category-card"
                  >
                    <div className="category-card-img">
                      {cat.image ? (
                        <img src={getImageUrl(cat.image)} alt={cat.name} />
                      ) : (
                        <span className="category-emoji">🎨</span>
                      )}
                    </div>
                    <span className="category-card-name">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="section-link-wrap">
              <Link to="/categories" className="btn btn-outline">
                View All Categories →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {show.featured !== false && (
        <ProductSection
          title={homepage.featuredTitle || "Featured Products"}
          subtitle={homepage.featuredSubtitle}
          params={{ featured: "true", limit: 8 }}
          linkText="View All Featured"
          linkTo="/shop"
        />
      )}

      {/* BEST SELLERS */}
      {show.bestSellers !== false && (
        <div className="section alt-section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{homepage.bestSellersTitle || "Best Sellers"}</h2>
              <p className="section-subtitle">{homepage.bestSellersSubtitle}</p>
            </div>
            <div className="product-grid">
              {bestSellers.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            <div className="section-link-wrap">
              <Link to="/shop?sort=best-selling" className="btn btn-outline">
                Shop Best Sellers →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* NEW ARRIVALS */}
      {show.newArrivals !== false && (
        <ProductSection
          title={homepage.newArrivalsTitle || "New Arrivals"}
          subtitle={homepage.newArrivalsSubtitle}
          params={{ sort: "newest", limit: 8 }}
          linkText="See What's New"
          linkTo="/shop?sort=newest"
        />
      )}

      {/* PERSONALIZED GIFTS */}
      {show.personalized !== false && (
        <section className="section banner-section">
          <div
            className="container banner-inner"
            style={homepage.personalizedImage ? { backgroundImage: `url(${getImageUrl(homepage.personalizedImage)})` } : {}}
          >
            <div className="banner-text">
              <h2>{homepage.personalizedTitle || "Personalized Gifts, Made Just for Them"}</h2>
              {homepage.personalizedSubtitle && <p>{homepage.personalizedSubtitle}</p>}
              <Link to={homepage.personalizedButtonLink || "/custom-orders"} className="btn btn-primary btn-lg">
                {homepage.personalizedButtonText || "Start a Custom Order"}
              </Link>
            </div>
            <div className="banner-art">
              <FaGift className="banner-icon" />
              <span className="banner-art-name">Crafted by {settings?.ownerName || "TakenBy_Crafts"}</span>
            </div>
          </div>
        </section>
      )}

      {/* CUSTOM CREATIONS */}
      {personalized.length > 0 && (
        <ProductSection
          title="Custom Creations"
          subtitle="Fully customizable pieces — designed by you, crafted by us."
          params={{ customizable: "true", limit: 8 }}
          linkText="Browse Customizable"
          linkTo="/shop?customizable=true"
        />
      )}

      {/* INSTAGRAM REELS */}
      {show.reels !== false && reels.filter((r) => r.active).length > 0 && (
        <section className="section alt-section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{homepage.reelsTitle || "Watch Us Create"}</h2>
              {homepage.reelsSubtitle && <p className="section-subtitle">{homepage.reelsSubtitle}</p>}
            </div>
            <div className="reels-grid">
              {reels.filter((r) => r.active).map((r) => (
                <InstagramReel key={r._id} url={r.url} title={r.title} />
              ))}
            </div>
            {instagramUrl && (
              <div className="section-link-wrap">
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                  <FaInstagram /> Follow us on Instagram
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CUSTOMER GALLERY */}
      {show.gallery !== false && galleryImages.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{homepage.galleryTitle || "From Our Customers"}</h2>
              {homepage.gallerySubtitle && <p className="section-subtitle">{homepage.gallerySubtitle}</p>}
            </div>
            <div className="gallery-grid">
              {galleryImages.slice(0, 8).map((g) => (
                <div className="gallery-item" key={g._id}>
                  <img src={getImageUrl(g.image)} alt={g.caption || "Customer craft"} loading="lazy" />
                  {g.caption && <span className="gallery-caption">{g.caption}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CUSTOMER REVIEWS / TESTIMONIALS */}
      {(testimonials.length > 0 || reviews.length > 0) && show.reviews !== false && (
        <section className="section alt-section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{homepage.reviewsTitle || "What Customers Say"}</h2>
              {homepage.reviewsSubtitle && <p className="section-subtitle">{homepage.reviewsSubtitle}</p>}
            </div>
            <div className="testimonial-grid">
              {(testimonials.length ? testimonials : reviews).slice(0, 6).map((t) => (
                <div className="testimonial-card" key={t._id}>
                  <div className="testimonial-stars">
                    <RatingStars rating={t.rating} size={16} />
                  </div>
                  <p className="testimonial-text">"{t.comment}"</p>
                  {t.verified && <span className="verified-badge">✓ Verified Purchase</span>}
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      {t.photo ? (
                        <img src={getImageUrl(t.photo)} alt={t.name || "Customer"} />
                      ) : (
                        (t.name || t.user?.firstName || "C").charAt(0)
                      )}
                    </div>
                    <div>
                      <strong>{t.name || (t.user ? `${t.user.firstName} ${t.user.lastName || ""}` : "Verified Customer")}</strong>
                      <span className="testimonial-role">{t.role || "Verified Customer"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT TAKENBY_CRAFTS */}
      {show.about !== false && (
        <section className="section about-preview">
          <div className="container about-preview-inner">
            <div className="about-preview-text">
              <h2>{homepage.aboutTitle || "About TakenBy_Crafts"}</h2>
              <p>{homepage.aboutSubtitle || ""}</p>
              <p className="about-preview-story">
                {about?.story || settings?.about || ""}
              </p>
              <Link to="/about" className="btn btn-outline">
                Read Our Story <FaArrowRight />
              </Link>
            </div>
            <div className="about-preview-cta">
              <div className="feature-card">
                <FaWhatsapp className="feature-icon" />
                <h3>Talk to Us</h3>
                <p>Questions or custom ideas? Chat with us directly on WhatsApp.</p>
                <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                  <FaWhatsapp /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WHY CRAFTORA */}
      <section className="section alt-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Why {settings?.websiteName || "TakenBy_Crafts"}?</h2>
            <p className="section-subtitle">Every purchase supports a real craft and a real artisan.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <FaPalette className="feature-icon" />
              <h3>Fully Customizable</h3>
              <p>Personalize colours, names, themes and more — request a reference for perfection.</p>
            </div>
            <div className="feature-card">
              <FaHeart className="feature-icon" />
              <h3>Handmade with Love</h3>
              <p>Every item is crafted by hand in small batches. No mass production, ever.</p>
            </div>
            <div className="feature-card">
              <FaTruck className="feature-icon" />
              <h3>Safe & Tracked Delivery</h3>
              <p>Careful packing and real-time order tracking from bench to doorstep.</p>
            </div>
            <div className="feature-card">
              <FaShieldAlt className="feature-icon" />
              <h3>Secure Payments</h3>
              <p>Pay by Cash on Delivery or UPI. Your payment details stay safe.</p>
            </div>
            <div className="feature-card">
              <FaLeaf className="feature-icon" />
              <h3>Eco-Friendly Materials</h3>
              <p>Natural flowers, recycled paper and sustainable materials where possible.</p>
            </div>
            <div className="feature-card">
              <FaGift className="feature-icon" />
              <h3>Gift Ready Packaging</h3>
              <p>Beautifully packed and ready to gift, with a handwritten note on request.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      {show.newsletter !== false && (
        <section className="section newsletter-section">
          <div className="container newsletter-box">
            <h2>{homepage.newsletterTitle || "Join the TakenBy_Crafts Circle"}</h2>
            {homepage.newsletterSubtitle && <p>{homepage.newsletterSubtitle}</p>}
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
            {newsletterMsg && <p className="newsletter-msg">{newsletterMsg}</p>}
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
