import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productService, categoryService } from "../services";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const CategoryProducts = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setLoading(true);
    categoryService
      .getAll()
      .then(({ data }) => {
        const found = data.categories.find((c) => c.slug === slug);
        if (found) setCategory(found);
      })
      .catch(() => {});

    productService
      .getProducts({ category: slug, sort, limit: 30 })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [slug, sort]);

  return (
    <div>
      <div className="page-banner">
        <div className="container">
          <Link to="/categories" className="breadcrumb-link">
            ← All Categories
          </Link>
          <h1>{category ? category.name : slug}</h1>
          <p>{category ? category.description : "Handmade with heart."}</p>
        </div>
      </div>
      <div className="container section">
        <div className="shop-toolbar">
          <p className="result-count">{products.length} products</p>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="best-selling">Best Selling</option>
          </select>
        </div>
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">🎨</p>
            <h3>No products in this category yet</h3>
            <Link to="/shop" className="btn btn-outline">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
