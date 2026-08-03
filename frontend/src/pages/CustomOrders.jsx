import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPalette, FaUpload, FaClipboardCheck, FaRupeeSign, FaCheckCircle } from "react-icons/fa";
import { productService } from "../services";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const steps = [
  { icon: <FaPalette />, title: "Submit Your Idea", desc: "Pick a customizable product and tell us your name, colours, theme & special instructions." },
  { icon: <FaUpload />, title: "Share a Reference", desc: "Upload a reference image so our artisan can match your vision perfectly." },
  { icon: <FaClipboardCheck />, title: "Seller Reviews", desc: "Your artisan reviews your request and sends a final price and confirmation." },
  { icon: <FaCheckCircle />, title: "We Craft It", desc: "Once you confirm, your one-of-a-kind piece is handmade and shipped to you." },
];

const CustomOrders = () => {
  const [customizableProducts, setCustomizableProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getProducts({ customizable: "true", limit: 8 })
      .then(({ data }) => setCustomizableProducts(data.products || []))
      .catch(() => setCustomizableProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-banner custom-banner">
        <div className="container">
          <h1>Custom Orders</h1>
          <p>Design it your way. Our artisans will bring it to life.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">How Custom Orders Work</h2>
            <p className="section-subtitle">Four simple steps from idea to masterpiece.</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{i + 1}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Customizable Products</h2>
            <p className="section-subtitle">
              Start with one of these — or <Link to="/contact">contact us</Link> about a completely new idea.
            </p>
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <div className="product-grid">
              {customizableProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
          <div className="section-link-wrap">
            <Link to="/shop?customizable=true" className="btn btn-outline">
              Browse All Customizable →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomOrders;
