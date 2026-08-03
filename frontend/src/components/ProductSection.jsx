import React, { useState, useEffect } from "react";
import { productService } from "../services";
import ProductCard from "./ProductCard";
import Spinner from "./Spinner";
import { Link } from "react-router-dom";

const ProductSection = ({ title, subtitle, params, linkText, linkTo }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productService
      .getProducts({ ...params, limit: params.limit || 8 })
      .then(({ data }) => {
        if (mounted) setProducts(data.products || []);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="section product-section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <p className="empty-text">No products to show yet.</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {linkText && linkTo && (
          <div className="section-link-wrap">
            <Link to={linkTo} className="btn btn-outline">
              {linkText} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
