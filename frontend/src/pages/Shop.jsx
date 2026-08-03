import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { productService, categoryService } from "../services";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minRating = searchParams.get("minRating") || "";
  const inStock = searchParams.get("inStock") || "";
  const customizable = searchParams.get("customizable") || "";
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    categoryService
      .getAll()
      .then(({ data }) => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;
    if (inStock) params.inStock = inStock;
    if (customizable) params.customizable = customizable;
    params.page = page;
    params.limit = 12;

    productService
      .getProducts(params)
      .then(({ data }) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort, minPrice, maxPrice, minRating, inStock, customizable, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value === undefined || value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="shop-page">
      <div className="page-banner">
        <div className="container">
          <h1>Shop Handmade</h1>
          <p>
            {total} unique craft{total === 1 ? "" : "s"} waiting for a home
          </p>
        </div>
      </div>

      <div className="container shop-container">
        <button
          className="btn btn-outline filter-toggle"
          onClick={() => setShowFilters((s) => !s)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        <div className={`shop-layout ${showFilters ? "filters-open" : ""}`}>
          <aside className="filter-sidebar">
            <div className="filter-head">
              <h3>Filters</h3>
              <button className="clear-filters" onClick={clearFilters}>
                <FaTimes /> Clear All
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="search-input-wrap">
                <input
                  type="text"
                  placeholder="Search crafts..."
                  value={search}
                  onChange={(e) => updateParam("search", e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={category}
                onChange={(e) => updateParam("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Price Range (₹)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={minPrice}
                  onChange={(e) => updateParam("minPrice", e.target.value)}
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => updateParam("maxPrice", e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => updateParam("minRating", e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
                <option value="2">2★ & above</option>
              </select>
            </div>

            <div className="filter-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={inStock === "true"}
                  onChange={(e) =>
                    updateParam("inStock", e.target.checked ? "true" : "")
                  }
                />
                In Stock only
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={customizable === "true"}
                  onChange={(e) =>
                    updateParam("customizable", e.target.checked ? "true" : "")
                  }
                />
                Customizable only
              </label>
            </div>
          </aside>

          <div className="shop-main">
            <div className="shop-toolbar">
              <p className="result-count">
                Showing {products.length} of {total} products
              </p>
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
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
                <p className="empty-emoji">🛍️</p>
                <h3>No crafts found</h3>
                <p>Try adjusting your filters or search.</p>
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${Number(page) === p ? "active" : ""}`}
                    onClick={() => updateParam("page", String(p))}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
