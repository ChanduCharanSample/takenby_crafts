import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import { useContent } from "../../context/ContentContext";

const AdminContent = () => {
  const { homepage, refresh } = useContent();
  const { showToast } = useToast();

  const [hero, setHero] = useState({
    image: homepage?.hero?.image || "",
    eyebrow: homepage?.hero?.eyebrow || "",
    heading: homepage?.hero?.heading || "",
    headingAccent: homepage?.hero?.headingAccent || "",
    subheading: homepage?.hero?.subheading || "",
    buttonText: homepage?.hero?.buttonText || "",
    buttonLink: homepage?.hero?.buttonLink || "/shop",
    secondaryButtonText: homepage?.hero?.secondaryButtonText || "",
    secondaryButtonLink: homepage?.hero?.secondaryButtonLink || "/custom-orders",
  });
  const [festival, setFestival] = useState({
    image: homepage?.festivalBanner?.image || "",
    title: homepage?.festivalBanner?.title || "",
    subtitle: homepage?.festivalBanner?.subtitle || "",
    buttonText: homepage?.festivalBanner?.buttonText || "",
    buttonLink: homepage?.festivalBanner?.buttonLink || "/shop",
    active: !!homepage?.festivalBanner?.active,
  });
  const [sectionText, setSectionText] = useState({
    categoriesTitle: homepage?.categoriesTitle || "Shop by Category",
    categoriesSubtitle: homepage?.categoriesSubtitle || "",
    featuredTitle: homepage?.featuredTitle || "Featured Products",
    featuredSubtitle: homepage?.featuredSubtitle || "",
    bestSellersTitle: homepage?.bestSellersTitle || "Best Sellers",
    bestSellersSubtitle: homepage?.bestSellersSubtitle || "",
    newArrivalsTitle: homepage?.newArrivalsTitle || "New Arrivals",
    newArrivalsSubtitle: homepage?.newArrivalsSubtitle || "",
    personalizedTitle: homepage?.personalizedTitle || "Personalized Gifts",
    personalizedSubtitle: homepage?.personalizedSubtitle || "",
    personalizedImage: homepage?.personalizedImage || "",
    personalizedButtonText: homepage?.personalizedButtonText || "",
    personalizedButtonLink: homepage?.personalizedButtonLink || "/custom-orders",
    reviewsTitle: homepage?.reviewsTitle || "What Customers Say",
    reviewsSubtitle: homepage?.reviewsSubtitle || "",
    galleryTitle: homepage?.galleryTitle || "From Our Customers",
    gallerySubtitle: homepage?.gallerySubtitle || "",
    reelsTitle: homepage?.reelsTitle || "Watch Us Create",
    reelsSubtitle: homepage?.reelsSubtitle || "",
    aboutTitle: homepage?.aboutTitle || "About TakenBy_Crafts",
    aboutSubtitle: homepage?.aboutSubtitle || "",
    newsletterTitle: homepage?.newsletterTitle || "Join the TakenBy_Crafts Circle",
    newsletterSubtitle: homepage?.newsletterSubtitle || "",
  });
  const [stats, setStats] = useState(
    (homepage?.stats || [{ value: "500+", label: "Handmade Pieces" }]).map((s) => ({ value: s.value, label: s.label }))
  );
  const [showSections, setShowSections] = useState({
    announcements: homepage?.showSections?.announcements ?? true,
    festivalBanner: homepage?.showSections?.festivalBanner ?? true,
    categories: homepage?.showSections?.categories ?? true,
    featured: homepage?.showSections?.featured ?? true,
    bestSellers: homepage?.showSections?.bestSellers ?? true,
    newArrivals: homepage?.showSections?.newArrivals ?? true,
    personalized: homepage?.showSections?.personalized ?? true,
    reels: homepage?.showSections?.reels ?? true,
    gallery: homepage?.showSections?.gallery ?? true,
    reviews: homepage?.showSections?.reviews ?? true,
    about: homepage?.showSections?.about ?? true,
    newsletter: homepage?.showSections?.newsletter ?? true,
  });
  const [files, setFiles] = useState({ heroImage: null, festivalImage: null, personalizedImage: null });
  const [saving, setSaving] = useState(false);

  const setSec = (key, value) => setSectionText((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      const payload = {
        hero,
        festivalBanner: { ...festival, active: !!festival.active },
        ...sectionText,
        stats: stats.filter((s) => s.value || s.label),
        showSections,
      };
      fd.append("data", JSON.stringify(payload));
      Object.keys(files).forEach((key) => {
        if (files[key]) fd.append(key, files[key]);
      });
      await contentService.updateHomepage(fd);
      await refresh();
      showToast("Homepage saved", "success");
    } catch (err) {
      showToast(getMessage(err, "Could not save homepage"), "error");
    } finally {
      setSaving(false);
    }
  };

  const SECTION_TOGGLES = [
    ["announcements", "Announcement Bar"],
    ["festivalBanner", "Festival Banner"],
    ["categories", "Shop by Category"],
    ["featured", "Featured Products"],
    ["bestSellers", "Best Sellers"],
    ["newArrivals", "New Arrivals"],
    ["personalized", "Personalized Banner"],
    ["reels", "Instagram Reels"],
    ["gallery", "Customer Gallery"],
    ["reviews", "Customer Reviews"],
    ["about", "About Section"],
    ["newsletter", "Newsletter Signup"],
  ];

  return (
    <div className="dash-content">
      <h1>Homepage Manager</h1>
      <p className="dash-sub">Edit the hero, festival banner, section titles and visibility.</p>

      <form onSubmit={handleSubmit}>
        <div className="dash-panel">
          <h3>Hero Section</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label>Hero Image</label>
              {hero.image && <img src={getImageUrl(hero.image)} alt="Hero" className="form-image-preview wide" />}
              <label className="file-upload-btn">
                {files.heroImage ? "Change Hero Image" : "Upload Hero Image"}
                <input type="file" accept="image/*" hidden onChange={(e) => setFiles((f) => ({ ...f, heroImage: e.target.files[0] }))} />
              </label>
            </div>
            <div className="form-group">
              <label>Eyebrow</label>
              <input value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Heading</label>
              <input value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Heading Accent (highlighted word)</label>
              <input value={hero.headingAccent} onChange={(e) => setHero({ ...hero, headingAccent: e.target.value })} />
            </div>
            <div className="form-group full">
              <label>Subheading</label>
              <input value={hero.subheading} onChange={(e) => setHero({ ...hero, subheading: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Primary Button Text</label>
              <input value={hero.buttonText} onChange={(e) => setHero({ ...hero, buttonText: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Primary Button Link</label>
              <input value={hero.buttonLink} onChange={(e) => setHero({ ...hero, buttonLink: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Secondary Button Text</label>
              <input value={hero.secondaryButtonText} onChange={(e) => setHero({ ...hero, secondaryButtonText: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Secondary Button Link</label>
              <input value={hero.secondaryButtonLink} onChange={(e) => setHero({ ...hero, secondaryButtonLink: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <h3>Festival Banner</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input value={festival.title} onChange={(e) => setFestival({ ...festival, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Subtitle</label>
              <input value={festival.subtitle} onChange={(e) => setFestival({ ...festival, subtitle: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Button Text</label>
              <input value={festival.buttonText} onChange={(e) => setFestival({ ...festival, buttonText: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Button Link</label>
              <input value={festival.buttonLink} onChange={(e) => setFestival({ ...festival, buttonLink: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Banner Image</label>
              {festival.image && <img src={getImageUrl(festival.image)} alt="Festival" className="form-image-preview wide" />}
              <label className="file-upload-btn">
                {files.festivalImage ? "Change Image" : "Upload Banner Image"}
                <input type="file" accept="image/*" hidden onChange={(e) => setFiles((f) => ({ ...f, festivalImage: e.target.files[0] }))} />
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={festival.active} onChange={(e) => setFestival({ ...festival, active: e.target.checked })} />
                Enable Festival Banner
              </label>
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <h3>Section Titles</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Categories Title</label>
              <input value={sectionText.categoriesTitle} onChange={(e) => setSec("categoriesTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Categories Subtitle</label>
              <input value={sectionText.categoriesSubtitle} onChange={(e) => setSec("categoriesSubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Featured Title</label>
              <input value={sectionText.featuredTitle} onChange={(e) => setSec("featuredTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Featured Subtitle</label>
              <input value={sectionText.featuredSubtitle} onChange={(e) => setSec("featuredSubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Best Sellers Title</label>
              <input value={sectionText.bestSellersTitle} onChange={(e) => setSec("bestSellersTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Best Sellers Subtitle</label>
              <input value={sectionText.bestSellersSubtitle} onChange={(e) => setSec("bestSellersSubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>New Arrivals Title</label>
              <input value={sectionText.newArrivalsTitle} onChange={(e) => setSec("newArrivalsTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>New Arrivals Subtitle</label>
              <input value={sectionText.newArrivalsSubtitle} onChange={(e) => setSec("newArrivalsSubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Reviews Title</label>
              <input value={sectionText.reviewsTitle} onChange={(e) => setSec("reviewsTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Reviews Subtitle</label>
              <input value={sectionText.reviewsSubtitle} onChange={(e) => setSec("reviewsSubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Gallery Title</label>
              <input value={sectionText.galleryTitle} onChange={(e) => setSec("galleryTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Gallery Subtitle</label>
              <input value={sectionText.gallerySubtitle} onChange={(e) => setSec("gallerySubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Reels Title</label>
              <input value={sectionText.reelsTitle} onChange={(e) => setSec("reelsTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Reels Subtitle</label>
              <input value={sectionText.reelsSubtitle} onChange={(e) => setSec("reelsSubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>About Title</label>
              <input value={sectionText.aboutTitle} onChange={(e) => setSec("aboutTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>About Subtitle</label>
              <input value={sectionText.aboutSubtitle} onChange={(e) => setSec("aboutSubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Newsletter Title</label>
              <input value={sectionText.newsletterTitle} onChange={(e) => setSec("newsletterTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Newsletter Subtitle</label>
              <input value={sectionText.newsletterSubtitle} onChange={(e) => setSec("newsletterSubtitle", e.target.value)} />
            </div>
          </div>

          <h3>Personalized Banner</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input value={sectionText.personalizedTitle} onChange={(e) => setSec("personalizedTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Subtitle</label>
              <input value={sectionText.personalizedSubtitle} onChange={(e) => setSec("personalizedSubtitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Button Text</label>
              <input value={sectionText.personalizedButtonText} onChange={(e) => setSec("personalizedButtonText", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Button Link</label>
              <input value={sectionText.personalizedButtonLink} onChange={(e) => setSec("personalizedButtonLink", e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Banner Image</label>
              {sectionText.personalizedImage && <img src={getImageUrl(sectionText.personalizedImage)} alt="Personalized" className="form-image-preview wide" />}
              <label className="file-upload-btn">
                {files.personalizedImage ? "Change Image" : "Upload Banner Image"}
                <input type="file" accept="image/*" hidden onChange={(e) => setFiles((f) => ({ ...f, personalizedImage: e.target.files[0] }))} />
              </label>
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <h3>Hero Stats</h3>
          {stats.map((s, i) => (
            <div className="form-grid stats-row" key={i}>
              <div className="form-group">
                <label>Value</label>
                <input value={s.value} onChange={(e) => setStats((prev) => prev.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))} placeholder="500+" />
              </div>
              <div className="form-group">
                <label>Label</label>
                <input value={s.label} onChange={(e) => setStats((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))} placeholder="Handmade Pieces" />
              </div>
              <button type="button" className="btn-icon danger" onClick={() => setStats((prev) => prev.filter((_, idx) => idx !== i))}>
                <FaTrash />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setStats((prev) => [...prev, { value: "", label: "" }])}>
            <FaPlus /> Add Stat
          </button>
        </div>

        <div className="dash-panel">
          <h3>Show / Hide Sections</h3>
          <div className="checkbox-grid">
            {SECTION_TOGGLES.map(([key, label]) => (
              <label className="checkbox-label" key={key}>
                <input type="checkbox" checked={!!showSections[key]} onChange={(e) => setShowSections((prev) => ({ ...prev, [key]: e.target.checked }))} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="dash-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Homepage"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminContent;
