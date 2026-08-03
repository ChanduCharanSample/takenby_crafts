import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUserCog,
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useContent } from "../context/ContentContext";
import { productService } from "../services";
import { getImageUrl, formatPrice, finalPrice } from "../utils/helpers";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { settings } = useContent();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  const siteName = settings?.websiteName || "TakenBy_Crafts";
  const logo = settings?.logo || "";

  useEffect(() => {
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!suggestOpen && !search) return;
    if (suggestOpen && search.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }
    if (!search.trim()) {
      setSuggestions({ products: [], categories: [] });
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      productService
        .suggest(search.trim())
        .then(({ data }) => {
          setSuggestions({ products: data.products || [], categories: data.categories || [] });
        })
        .catch(() => setSuggestions({ products: [], categories: [] }))
        .finally(() => setSearchLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, suggestOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSuggestOpen(false);
    navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  const goToProduct = (id) => {
    setSuggestOpen(false);
    setSearch("");
    navigate(`/product/${id}`);
  };

  const goToCategory = (slug) => {
    setSuggestOpen(false);
    setSearch("");
    navigate(`/category/${slug}`);
  };

  const dashboardPath = user ? (user.role === "admin" ? "/admin" : "/account") : "/login";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          {logo ? (
            <img src={getImageUrl(logo)} alt={siteName} className="logo-img" />
          ) : (
            <span className="logo-icon">🎨</span>
          )}
          <span className="logo-text">{siteName}</span>
        </Link>

        <div className="navbar-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search crafts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSuggestOpen(true);
              }}
              onFocus={() => setSuggestOpen(true)}
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => { setSearch(""); setSuggestOpen(false); }}>
                <FaTimes />
              </button>
            )}
          </form>
          {suggestOpen && search.trim().length >= 2 && (
            <div className="suggest-dropdown">
              {searchLoading && <div className="suggest-loading">Searching…</div>}
              {!searchLoading &&
                suggestions.products.length === 0 &&
                suggestions.categories.length === 0 && (
                  <div className="suggest-empty">No matches for "{search}"</div>
                )}
              {suggestions.categories.length > 0 && (
                <div className="suggest-group">
                  <span className="suggest-label">Categories</span>
                  {suggestions.categories.map((c) => (
                    <button key={c._id} className="suggest-item" onClick={() => goToCategory(c.slug)}>
                      <span className="suggest-cat-icon">#</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.products.length > 0 && (
                <div className="suggest-group">
                  <span className="suggest-label">Products</span>
                  {suggestions.products.map((p) => (
                    <button key={p._id} className="suggest-item" onClick={() => goToProduct(p._id)}>
                      <img src={getImageUrl(p.coverImage || p.images?.[0])} alt={p.name} />
                      <span className="suggest-name">{p.name}</span>
                      <span className="suggest-price">{formatPrice(finalPrice(p))}</span>
                    </button>
                  ))}
                </div>
              )}
              <button className="suggest-all" onClick={handleSearchSubmit}>
                See all results for "{search}" →
              </button>
            </div>
          )}
        </div>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/categories" onClick={() => setMenuOpen(false)}>Categories</NavLink>
          <NavLink to="/custom-orders" onClick={() => setMenuOpen(false)}>Custom Orders</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          <NavLink to="/faq" onClick={() => setMenuOpen(false)}>FAQ</NavLink>
          {user && user.role === "admin" && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <NavLink to="/wishlist" className="icon-btn" title="Wishlist">
            <FaHeart />
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </NavLink>
          <NavLink to="/cart" className="icon-btn" title="Cart">
            <FaShoppingCart />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>

          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="icon-btn user-btn"
                onClick={() => setUserMenuOpen((o) => !o)}
                title="Account"
              >
                <FaUser />
                <FaChevronDown className="caret" size={10} />
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-greet">
                    Hello, <strong>{user.firstName}</strong>
                  </div>
                  <Link to={dashboardPath} onClick={() => setUserMenuOpen(false)}>
                    <FaUserCog /> {user.role === "admin" ? "Admin Dashboard" : "My Account"}
                  </Link>
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)}>
                    <FaBoxOpen /> My Orders
                  </Link>
                  <Link to="/custom-orders/my" onClick={() => setUserMenuOpen(false)}>
                    <FaClipboardList /> My Custom Orders
                  </Link>
                  <button className="dropdown-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm nav-login"
              onClick={() => navigate("/login")}
            >
              <FaUser /> Login
            </button>
          )}

          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
