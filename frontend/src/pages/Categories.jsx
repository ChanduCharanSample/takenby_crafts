import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryService } from "../services";
import { getImageUrl } from "../utils/helpers";
import Spinner from "../components/Spinner";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getAll()
      .then(({ data }) => setCategories(data.categories || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-banner">
        <div className="container">
          <h1>Our Craft Categories</h1>
          <p>Every category, every craft, made by hand.</p>
        </div>
      </div>
      <div className="container section">
        {loading ? (
          <Spinner />
        ) : (
          <div className="category-grid large">
            {categories.map((cat) => (
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
                {cat.description && (
                  <p className="category-card-desc">{cat.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
