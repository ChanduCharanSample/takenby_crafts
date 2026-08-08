import React from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaYoutube,
  FaHeart,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaWhatsapp,
} from "react-icons/fa";
import { useContent } from "../context/ContentContext";
import { getImageUrl } from "../utils/helpers";

const Footer = () => {
  const { settings, footer, social } = useContent();
  const siteName = settings?.websiteName || "TakenBy_Crafts";
  const logo = settings?.logo || "";
  const socialLinks = [
    { url: social?.instagram, icon: <FaInstagram />, label: "Instagram" },
    { url: social?.facebook, icon: <FaFacebookF />, label: "Facebook" },
    { url: social?.youtube, icon: <FaYoutube />, label: "YouTube" },
    { url: social?.pinterest, icon: <FaPinterestP />, label: "Pinterest" },
    { url: social?.maps, icon: <FaMapMarkerAlt />, label: "Google Maps" },
    { url: social?.website, icon: <FaGlobe />, label: "Website" },
    { url: social?.whatsapp, icon: <FaWhatsapp />, label: "WhatsApp" },
  ].filter((s) => s.url);

  const quickLinks = footer?.quickLinks?.length ? footer.quickLinks : [
    { label: "Shop All", url: "/shop" },
    { label: "Categories", url: "/categories" },
    { label: "Custom Orders", url: "/custom-orders" },
    { label: "About Us", url: "/about" },
    { label: "Contact", url: "/contact" },
  ];
  const careLinks = footer?.customerCareLinks?.length ? footer.customerCareLinks : [
    { label: "Track Order", url: "/orders" },
    { label: "Cart", url: "/cart" },
    { label: "Wishlist", url: "/wishlist" },
    { label: "My Account", url: "/account" },
  ];
  const policyLinks = footer?.policyLinks?.length ? footer.policyLinks : [
    { label: "Privacy Policy", url: "/privacy-policy" },
    { label: "Terms & Conditions", url: "/terms" },
    { label: "Return Policy", url: "/return-policy" },
    { label: "FAQ", url: "/faq" },
  ];

  const renderLinks = (links, cls = "") =>
    links.map((l, i) => (
      <li key={i}>
        <Link to={l.url || "#"} className={cls}>{l.label}</Link>
      </li>
    ));

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col footer-brand">
          <Link to="/" className="logo">
            {logo ? (
              <img src={getImageUrl(logo)} alt={siteName} className="logo-img" />
            ) : (
              <span className="logo-icon">🎨</span>
            )}
            <span className="logo-text">{siteName}</span>
          </Link>
          <p>{footer?.aboutText || settings?.about || ""}</p>
          {footer?.showSocial && socialLinks.length > 0 && (
            <div className="social-icons">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>{renderLinks(quickLinks)}</ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>{renderLinks(careLinks)}</ul>
        </div>

        <div className="footer-col">
          <h4>Get in Touch</h4>
          <ul className="footer-contact">
            <li><FaPhone /> {settings?.phone || "+91 98765 43210"}</li>
            <li><FaEnvelope /> {settings?.email || "hello@takenbycrafts.com"}</li>
            <li><FaMapMarkerAlt /> {settings?.address
              ? `${settings.address.street}, ${settings.address.city}, ${settings.address.state}`
              : "TakenBy_Crafts Studio, Jaipur"}</li>
          </ul>
          <h4 className="footer-policy-head">Policies</h4>
          <ul className="footer-policy-links">
            {policyLinks.map((l, i) => (
              <li key={i}>
                <Link to={l.url || "#"}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {siteName}. {settings?.copyrightText || "Made with"}{" "}
          <FaHeart className="footer-heart" /> {settings?.ownerName ? `by ${settings.ownerName}.` : "by hand."}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
