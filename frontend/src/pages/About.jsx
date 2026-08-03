import React from "react";
import { Link } from "react-router-dom";
import {
  FaHandHoldingHeart,
  FaLeaf,
  FaUsers,
  FaHeart,
  FaCertificate,
  FaAward,
  FaCamera,
} from "react-icons/fa";
import { useContent } from "../context/ContentContext";
import { getImageUrl } from "../utils/helpers";

const About = () => {
  const { about, settings } = useContent();

  const story = about?.story || settings?.about || "";
  const mission = about?.mission || "";
  const vision = about?.vision || "";
  const journey = about?.journey || "";
  const achievements = about?.achievements || [];
  const certificates = about?.certificates || [];
  const galleryImages = about?.galleryImages || [];
  const workshopImages = about?.workshopImages || [];
  const stallPhotos = about?.stallPhotos || [];

  return (
    <div>
      <div className="page-banner">
        <div className="container">
          <h1>About {settings?.websiteName || "TakenBy_Crafts"}</h1>
          <p>Handmade with heart, delivered with care.</p>
        </div>
      </div>

      <section className="section">
        <div className="container about-layout">
          <div className="about-story">
            <h2>Our Story</h2>
            <p>{story || "TakenBy_Crafts was born from a simple belief — that the things we keep should carry meaning, warmth and a human touch. Every piece is crafted by hand, in small batches, and made just for you."}</p>
            {mission && (
              <>
                <h3>Our Mission</h3>
                <p>{mission}</p>
              </>
            )}
            {vision && (
              <>
                <h3>Our Vision</h3>
                <p>{vision}</p>
              </>
            )}
            {journey && (
              <>
                <h3>Our Journey</h3>
                <p>{journey}</p>
              </>
            )}
          </div>
          <div className="about-values">
            <div className="value-card">
              <FaHandHoldingHeart />
              <h3>Supporting Craft</h3>
              <p>Every purchase celebrates the hands that made it.</p>
            </div>
            <div className="value-card">
              <FaLeaf />
              <h3>Sustainable Craft</h3>
              <p>Natural materials, minimal waste, gift-ready packaging.</p>
            </div>
            <div className="value-card">
              <FaHeart />
              <h3>Made with Love</h3>
              <p>No factories, no mass production. Just beautiful handmade art.</p>
            </div>
            <div className="value-card">
              <FaUsers />
              <h3>Our Community</h3>
              <p>From {settings?.ownerName || "Chandrika"}'s bench to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {(achievements.length > 0 || certificates.length > 0) && (
        <section className="section alt-section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">Achievements & Certificates</h2>
              <p className="section-subtitle">Milestones we're proud of.</p>
            </div>
            <div className="achievement-grid">
              {achievements.map((a, i) => (
                <div className="achievement-card" key={i}>
                  <FaAward />
                  <p>{a}</p>
                </div>
              ))}
              {certificates.map((c, i) => (
                <div className="achievement-card" key={`c-${i}`}>
                  <FaCertificate />
                  <p>{c}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">Inside the Studio</h2>
              <p className="section-subtitle">A peek into our creative space.</p>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((img, i) => (
                <div className="gallery-item" key={i}>
                  <img src={getImageUrl(img)} alt="Studio gallery" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(workshopImages.length > 0 || stallPhotos.length > 0) && (
        <section className="section alt-section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">Workshops & Events</h2>
              <p className="section-subtitle">Creating together, in person.</p>
            </div>
            <div className="gallery-grid">
              {workshopImages.map((img, i) => (
                <div className="gallery-item" key={i}>
                  <img src={getImageUrl(img)} alt="Workshop" loading="lazy" />
                  <span className="gallery-caption"><FaCamera /> Workshop</span>
                </div>
              ))}
              {stallPhotos.map((img, i) => (
                <div className="gallery-item" key={`s-${i}`}>
                  <img src={getImageUrl(img)} alt="Craft stall" loading="lazy" />
                  <span className="gallery-caption"><FaCamera /> Craft Stall</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section alt-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Join Our Community</h2>
            <p className="section-subtitle">Be part of a movement that values handmade.</p>
          </div>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Create an Account</Link>
            <Link to="/shop" className="btn btn-outline btn-lg">Explore the Shop</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
