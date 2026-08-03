import React, { useState, useMemo } from "react";
import { FaChevronDown, FaQuestionCircle, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useAuth } from "../context/AuthContext";

const Faq = () => {
  const { faqs, settings, contact, social } = useContent();
  const { user } = useAuth();
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? faqs.filter(
          (f) =>
            f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
        )
      : faqs;
    const map = {};
    filtered.forEach((f) => {
      const cat = f.category || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(f);
    });
    return map;
  }, [faqs, search]);

  const whatsapp = contact?.whatsapp || settings?.whatsapp || social?.whatsapp || "919876543210";
  const waLink = `https://wa.me/${String(whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello ${settings?.websiteName || "TakenBy_Crafts"}! I have a question.`
  )}`;

  const toggle = (id) => setActive((a) => (a === id ? null : id));

  return (
    <div>
      <div className="page-banner">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Answers to common questions about ordering, shipping, customisation and more.</p>
        </div>
      </div>

      <div className="container section faq-page">
        <div className="faq-search">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">❓</p>
            <h3>No FAQs available</h3>
            <p>Questions are being added. Meanwhile, feel free to reach out to us directly.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, list]) => (
            <div className="faq-group" key={cat}>
              <h3 className="faq-category">
                <FaQuestionCircle /> {cat}
              </h3>
              <div className="faq-list">
                {list.map((f) => (
                  <div className={`faq-item ${active === f._id ? "open" : ""}`} key={f._id}>
                    <button className="faq-question" onClick={() => toggle(f._id)}>
                      <span>{f.question}</span>
                      <FaChevronDown className="faq-chevron" />
                    </button>
                    <div className="faq-answer">{f.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="faq-help">
          <h3>Still have questions?</h3>
          <p>
            {user
              ? "Chat with us on WhatsApp — we usually reply within minutes."
              : "Create an account or chat with us on WhatsApp for a faster reply."}
          </p>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
            <FaWhatsapp /> Chat on WhatsApp
          </a>{" "}
          <Link to="/contact" className="btn btn-outline">Contact Page</Link>
        </div>
      </div>
    </div>
  );
};

export default Faq;
