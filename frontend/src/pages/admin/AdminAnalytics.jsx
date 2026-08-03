import React, { useState, useEffect } from "react";
import { adminService } from "../../services";
import { formatPrice } from "../../utils/helpers";
import Spinner from "../../components/Spinner";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then(({ data }) => setData(data.analytics))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (!data) {
    return <div className="dash-content"><div className="form-error">Could not load analytics</div></div>;
  }

  const maxDay = Math.max(1, ...data.salesByDay.map((d) => d.total));
  const maxStatus = Math.max(1, ...data.ordersByStatus.map((s) => s.count));
  const maxCat = Math.max(1, ...data.categoryDistribution.map((c) => c.count));
  const maxOrderedCat = Math.max(1, ...data.mostOrderedCategories.map((c) => c.count));

  return (
    <div className="dash-content">
      <h1>Analytics</h1>
      <p className="dash-sub">Sales trends from the last 30 days.</p>

      <div className="dash-panel">
        <h3>Sales (last 30 days)</h3>
        {data.salesByDay.length === 0 ? (
          <p className="empty-text">No sales in the last 30 days.</p>
        ) : (
          <div className="bar-chart">
            {data.salesByDay.map((d) => (
              <div className="bar-col" key={d._id} title={`${d._id}: ${formatPrice(d.total)}`}>
                <div
                  className="bar"
                  style={{ height: `${Math.max(4, (d.total / maxDay) * 100)}%` }}
                />
                <span className="bar-label">{d._id.slice(8)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dash-cols">
        <div className="dash-panel">
          <h3>Top Selling Products</h3>
          {data.topProducts.length === 0 ? (
            <p className="empty-text">No products sold yet.</p>
          ) : (
            <div className="top-products">
              {data.topProducts.map((p, i) => (
                <div className="top-product" key={p._id}>
                  <span className="top-rank">{i + 1}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <p>{p.salesCount} sold • {formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-panel">
          <h3>Most Viewed Products</h3>
          {data.mostViewed.length === 0 ? (
            <p className="empty-text">No views recorded yet.</p>
          ) : (
            <div className="top-products">
              {data.mostViewed.map((p, i) => (
                <div className="top-product" key={p._id}>
                  <span className="top-rank">{i + 1}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <p>{p.viewCount} views</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dash-cols">
        <div className="dash-panel">
          <h3>Orders by Status</h3>
          <div className="status-bars">
            {data.ordersByStatus.map((s) => (
              <div className="status-bar-row" key={s._id}>
                <span className="status-bar-label">{s._id}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="status-bar-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-panel">
          <h3>Most Ordered Categories</h3>
          {data.mostOrderedCategories.length === 0 ? (
            <p className="empty-text">No orders yet.</p>
          ) : (
            <div className="status-bars">
              {data.mostOrderedCategories.map((c) => (
                <div className="status-bar-row" key={c.name}>
                  <span className="status-bar-label">{c.name}</span>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill cat"
                      style={{ width: `${(c.count / maxOrderedCat) * 100}%` }}
                    />
                  </div>
                  <span className="status-bar-count">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dash-panel">
        <h3>Products by Category</h3>
        <div className="status-bars">
          {data.categoryDistribution.map((c) => (
            <div className="status-bar-row" key={c.name}>
              <span className="status-bar-label">{c.name}</span>
              <div className="status-bar-track">
                <div
                  className="status-bar-fill cat"
                  style={{ width: `${(c.count / maxCat) * 100}%` }}
                />
              </div>
              <span className="status-bar-count">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
