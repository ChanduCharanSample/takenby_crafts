import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaBoxOpen,
  FaClipboardList,
  FaRupeeSign,
  FaHourglassHalf,
  FaTags,
  FaStar,
  FaTicketAlt,
  FaMoneyBillWave,
  FaBoxes,
  FaPalette,
  FaCheckCircle,
  FaBullhorn,
  FaVideo,
  FaCalendarDay,
  FaCalendarAlt,
} from "react-icons/fa";
import { adminService } from "../../services";
import { formatPrice, formatDate, getImageUrl } from "../../utils/helpers";
import Spinner from "../../components/Spinner";
import StatCard from "../../components/StatCard";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (!stats) {
    return <div className="dash-content"><div className="form-error">Could not load dashboard</div></div>;
  }

  const formatStatus = (s) => s.replace(/\s/g, "-").toLowerCase();

  return (
    <div className="dash-content">
      <h1>Admin Dashboard</h1>
      <p className="dash-sub">Overview of your craft store.</p>

      <div className="stats-grid">
        <StatCard icon={<FaBoxOpen />} label="Total Products" value={stats.totalProducts} accent="rose" />
        <StatCard icon={<FaTags />} label="Total Categories" value={stats.totalCategories} accent="sage" />
        <StatCard icon={<FaUsers />} label="Total Customers" value={stats.totalUsers} accent="sage" />
        <StatCard icon={<FaClipboardList />} label="Total Orders" value={stats.totalOrders} accent="gold" />
        <StatCard icon={<FaHourglassHalf />} label="Pending Orders" value={stats.pendingOrders} accent="brown" />
        <StatCard icon={<FaCheckCircle />} label="Completed Orders" value={stats.completedOrders} accent="terracotta" />
        <StatCard icon={<FaMoneyBillWave />} label="Payments to Verify" value={stats.pendingPayments} accent="rose" />
        <StatCard icon={<FaPalette />} label="Pending Custom Requests" value={stats.pendingCustomizations} accent="terracotta" />
      </div>

      <div className="stats-grid">
        <StatCard icon={<FaCalendarDay />} label="Revenue Today" value={formatPrice(stats.revenueToday)} accent="gold" />
        <StatCard icon={<FaCalendarAlt />} label="Revenue This Month" value={formatPrice(stats.revenueThisMonth)} accent="terracotta" />
        <StatCard icon={<FaRupeeSign />} label="Total Revenue" value={formatPrice(stats.totalRevenue)} accent="terracotta" />
        <StatCard icon={<FaStar />} label="Reviews" value={stats.totalReviews} accent="gold" />
        <StatCard icon={<FaBoxes />} label="Low Stock Products" value={stats.lowStockCount} accent="rose" />
        <StatCard icon={<FaBullhorn />} label="Announcements" value={stats.totalAnnouncements} accent="sage" />
        <StatCard icon={<FaVideo />} label="Instagram Reels" value={stats.totalReels} accent="brown" />
        <StatCard icon={<FaTicketAlt />} label="Coupons" value={stats.totalCoupons} accent="sage" />
      </div>

      <div className="dash-cols">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders">View All →</Link>
          </div>
          {stats.recentOrders?.length === 0 ? (
            <p className="empty-text">No orders yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders?.map((o) => (
                    <tr key={o._id}>
                      <td>#{o._id.slice(-8).toUpperCase()}</td>
                      <td>{o.user?.firstName} {o.user?.lastName}</td>
                      <td>{formatPrice(o.total)}</td>
                      <td>
                        <span className={`order-status status-${formatStatus(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Top Products</h3>
            <Link to="/admin/products">Manage →</Link>
          </div>
          {stats.topProducts?.length === 0 ? (
            <p className="empty-text">No products sold yet.</p>
          ) : (
            <div className="top-products">
              {stats.topProducts?.map((p, i) => (
                <div className="top-product" key={p._id}>
                  <span className="top-rank">{i + 1}</span>
                  <img src={getImageUrl(p.coverImage || p.images?.[0])} alt={p.name} className="top-product-img" />
                  <div>
                    <strong>{p.name}</strong>
                    <p>{p.salesCount} sold • {formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dash-cols">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Low Stock Alert</h3>
            <Link to="/admin/inventory">Inventory →</Link>
          </div>
          {stats.lowStock?.length === 0 ? (
            <p className="empty-text">All products are well stocked. 🎉</p>
          ) : (
            <div className="low-stock-list">
              {stats.lowStock.map((p) => (
                <div className="low-stock-item" key={p._id}>
                  <img src={getImageUrl(p.coverImage || p.images?.[0])} alt={p.name} />
                  <div>
                    <strong>{p.name}</strong>
                    <p>{p.stock} left (threshold {p.lowStockThreshold})</p>
                  </div>
                  <span className="stock-low-tag">Low</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Recent Reviews</h3>
            <Link to="/admin/reviews">View All →</Link>
          </div>
          {stats.recentReviews?.length === 0 ? (
            <p className="empty-text">No reviews yet.</p>
          ) : (
            <div className="recent-reviews">
              {stats.recentReviews?.map((r) => (
                <div className="recent-review" key={r._id}>
                  <div className="review-avatar">{r.user?.firstName?.charAt(0) || "U"}</div>
                  <div>
                    <strong>{r.user?.firstName} {r.user?.lastName}</strong>
                    <p className="review-product-name">{r.product?.name}</p>
                    <span className="review-stars">{Array.from({ length: r.rating }).map((_, i) => "★").join("")}</span>
                  </div>
                  <span className="order-date">{formatDate(r.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
