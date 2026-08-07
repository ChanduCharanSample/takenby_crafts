import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaTags,
  FaClipboardList,
  FaStar,
  FaTicketAlt,
  FaPalette,
  FaChartBar,
  FaBars,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaBoxes,
  FaHome,
  FaBullhorn,
  FaVideo,
  FaImages,
  FaCog,
  FaShareAlt,
  FaInfoCircle,
  FaEnvelope,
  FaGift,
  FaWindowRestore,
  FaQuestionCircle,
  FaCommentDots,
  FaInbox,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useContent } from "../../context/ContentContext";
import { getImageUrl } from "../../utils/helpers";
import { contactMessageService } from "../../services";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { settings } = useContent();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const logo = settings?.logo || "";

  useEffect(() => {
    let active = true;
    const fetchCount = () =>
      contactMessageService
        .unreadCount()
        .then(({ data }) => {
          if (active) setUnreadCount(data.unread || 0);
        })
        .catch(() => {
          if (active) setUnreadCount(0);
        });
    fetchCount();
    const t = setInterval(fetchCount, 60000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const links = [
    { to: "/admin", label: "Dashboard", icon: <FaTachometerAlt />, end: true },
    { to: "/admin/payments", label: "Payment Verification", icon: <FaMoneyBillWave /> },
    { to: "/admin/orders", label: "Orders", icon: <FaClipboardList /> },
    { to: "/admin/products", label: "Products", icon: <FaBoxOpen /> },
    { to: "/admin/categories", label: "Categories", icon: <FaTags /> },
    { to: "/admin/inventory", label: "Inventory", icon: <FaBoxes /> },
    { to: "/admin/reviews", label: "Reviews", icon: <FaStar /> },
    { to: "/admin/custom-requests", label: "Custom Requests", icon: <FaPalette /> },
    { to: "/admin/coupons", label: "Coupons", icon: <FaTicketAlt /> },
    { to: "/admin/users", label: "Users", icon: <FaUsers /> },
    { to: "/admin/content", label: "Homepage", icon: <FaHome /> },
    { to: "/admin/announcements", label: "Announcements", icon: <FaBullhorn /> },
    { to: "/admin/reels", label: "Reels", icon: <FaVideo /> },
    { to: "/admin/gallery", label: "Gallery", icon: <FaImages /> },
    { to: "/admin/about", label: "About Page", icon: <FaInfoCircle /> },
    { to: "/admin/contact", label: "Contact Page", icon: <FaEnvelope /> },
    { to: "/admin/contact-messages", label: "Contact Messages", icon: <FaInbox /> },
    { to: "/admin/social", label: "Social Links", icon: <FaShareAlt /> },
    { to: "/admin/settings", label: "Settings", icon: <FaCog /> },
    { to: "/admin/analytics", label: "Analytics", icon: <FaChartBar /> },
    { to: "/admin/campaigns", label: "Festival Campaigns", icon: <FaGift /> },
    { to: "/admin/popups", label: "Popup Manager", icon: <FaWindowRestore /> },
    { to: "/admin/faqs", label: "FAQ Manager", icon: <FaQuestionCircle /> },
    { to: "/admin/testimonials", label: "Testimonials", icon: <FaCommentDots /> },
  ];

  return (
    <div className="dashboard-layout admin">
      <button className="dash-toggle" onClick={() => setSidebarOpen((o) => !o)}>
        <FaBars /> Menu
      </button>

      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="dash-brand">
          {logo ? (
            <img src={getImageUrl(logo)} alt={settings?.websiteName || "Logo"} className="dash-brand-logo" />
          ) : (
            <span className="logo-icon">👑</span>
          )}
          <div>
            <strong>Admin Panel</strong>
            <p>{user?.firstName} {user?.lastName}</p>
          </div>
        </div>
        <nav className="dash-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setSidebarOpen(false)}
            >
              {l.icon} {l.label}
              {l.to === "/admin/contact-messages" && unreadCount > 0 && (
                <span className="sidebar-badge">{unreadCount}</span>
              )}
            </NavLink>
          ))}
          <button
            className="dash-logout"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="dash-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
