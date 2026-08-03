import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PopupModal from "./components/PopupModal";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CustomOrders from "./pages/CustomOrders";
import CustomOrderForm from "./pages/CustomOrderForm";
import MyCustomOrders from "./pages/MyCustomOrders";
import CustomOrderStatus from "./pages/CustomOrderStatus";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCustomRequests from "./pages/admin/AdminCustomRequests";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminContent from "./pages/admin/AdminContent";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminReels from "./pages/admin/AdminReels";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSocial from "./pages/admin/AdminSocial";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminContact from "./pages/admin/AdminContact";
import AdminFestivalCampaigns from "./pages/admin/AdminFestivalCampaigns";
import AdminPopups from "./pages/admin/AdminPopups";
import AdminFAQs from "./pages/admin/AdminFAQs";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import Faq from "./pages/Faq";

function App() {
  return (
    <div className="app">
      <Navbar />
      <PopupModal />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:slug" element={<CategoryProducts />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route path="/custom-orders" element={<CustomOrders />} />
          <Route
            path="/custom-orders/new/:productId"
            element={
              <ProtectedRoute>
                <CustomOrderForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-orders/my"
            element={
              <ProtectedRoute>
                <MyCustomOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-orders/status/:id"
            element={
              <ProtectedRoute>
                <CustomOrderStatus />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers role="customer" />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="custom-requests" element={<AdminCustomRequests />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="reels" element={<AdminReels />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="social" element={<AdminSocial />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="campaigns" element={<AdminFestivalCampaigns />} />
            <Route path="popups" element={<AdminPopups />} />
            <Route path="faqs" element={<AdminFAQs />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
