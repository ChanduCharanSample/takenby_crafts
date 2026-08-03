import api from "./api.js";

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/upload", formData);
};

export const userService = {
  registerRequest: (data) => api.post("/users/register/request", data),
  registerVerify: (data) => api.post("/users/register/verify", data),
  login: (data) => api.post("/users/login", data),
  adminLogin: (data) => api.post("/users/admin-login", data),
  forgotPassword: (data) => api.post("/users/forgot-password", data),
  resetPassword: (data) => api.post("/users/reset-password", data),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getAllUsers: (role) => api.get(`/users${role ? `?role=${role}` : ""}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const productService = {
  getProducts: (params) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getRelated: (id) => api.get(`/products/${id}/related`),
  suggest: (q) => api.get("/products/search/suggest", { params: { q } }),
  adminAll: (status) => api.get("/products/all", { params: status ? { status } : {} }),
  create: (formData) => api.post("/products", formData),
  update: (id, formData) => api.put(`/products/${id}`, formData),
  remove: (id) => api.delete(`/products/${id}`),
  duplicate: (id) => api.post(`/products/${id}/duplicate`),
  archive: (id) => api.put(`/products/${id}/archive`),
  restore: (id) => api.put(`/products/${id}/restore`),
  publish: (id, published) => api.put(`/products/${id}/publish`, { published }),
  reorderImages: (id, images, coverImage) =>
    api.put(`/products/${id}/images/reorder`, { images, coverImage }),
  deleteImage: (id, image) => api.delete(`/products/${id}/images`, { params: { image } }),
};

export const categoryService = {
  getAll: () => api.get("/categories"),
  adminAll: () => api.get("/categories/all"),
  get: (id) => api.get(`/categories/${id}`),
  create: (formData) => api.post("/categories", formData),
  update: (id, formData) => api.put(`/categories/${id}`, formData),
  reorder: (order) => api.put("/categories/reorder", { order }),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const cartService = {
  getCart: () => api.get("/cart"),
  add: (productId, quantity) => api.post("/cart", { productId, quantity }),
  updateQty: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete("/cart"),
  applyCoupon: (code) => api.post("/cart/coupon", { code }),
  removeCoupon: () => api.delete("/cart/coupon"),
};

export const wishlistService = {
  getWishlist: () => api.get("/wishlist"),
  add: (productId) => api.post("/wishlist", { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const orderService = {
  create: (data) => api.post("/orders", data),
  myOrders: () => api.get("/orders/my-orders"),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
  updateStatus: (id, status, reason) => api.put(`/orders/${id}/status`, { status, reason }),
  verifyPayment: (id, approve, notes) =>
    api.put(`/orders/${id}/verify-payment`, { approve, notes }),
  allOrders: (status) => api.get("/orders", { params: status ? { status } : {} }),
  pendingPayments: () => api.get("/orders/pending-payments"),
  inventoryLogs: () => api.get("/orders/inventory-logs"),
};

export const reviewService = {
  create: (formData) => api.post("/reviews", formData),
  productReviews: (productId) => api.get(`/reviews/product/${productId}`),
  adminAll: () => api.get("/reviews/all"),
  feature: (id) => api.put(`/reviews/${id}/feature`),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const customizationService = {
  create: (formData) => api.post("/customizations", formData),
  my: () => api.get("/customizations/my"),
  adminAll: (status) => api.get("/customizations/all", { params: status ? { status } : {} }),
  getById: (id) => api.get(`/customizations/${id}`),
  updateStatus: (id, data) => api.put(`/customizations/${id}/status`, data),
  cancel: (id) => api.put(`/customizations/${id}/cancel`),
};

export const couponService = {
  validate: (code, amount) => api.post("/coupons/validate", { code, amount }),
  getAll: () => api.get("/coupons"),
  create: (data) => api.post("/coupons", data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  remove: (id) => api.delete(`/coupons/${id}`),
};

export const contentService = {
  bootstrap: () => api.get("/content/bootstrap"),
  updateSettings: (data) => api.put("/content/settings", data),
  updateHomepage: (data) => api.put("/content/homepage", data),
  updateFooter: (data) => api.put("/content/footer", data),
  updateSocial: (data) => api.put("/content/social", data),
  updateAbout: (data) => api.put("/content/about", data),
  updateContact: (data) => api.put("/content/contact", data),
  announcements: () => api.get("/content/announcements/all"),
  createAnnouncement: (data) => api.post("/content/announcements", data),
  updateAnnouncement: (id, data) => api.put(`/content/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/content/announcements/${id}`),
  reels: () => api.get("/content/reels/all"),
  createReel: (data) => api.post("/content/reels", data),
  updateReel: (id, data) => api.put(`/content/reels/${id}`, data),
  deleteReel: (id) => api.delete(`/content/reels/${id}`),
  reelVideo: (url) => api.get("/content/reels/video", { params: { url } }),
  gallery: () => api.get("/content/gallery/all"),
  createGalleryItem: (data) => api.post("/content/gallery", data),
  updateGalleryItem: (id, data) => api.put(`/content/gallery/${id}`, data),
  deleteGalleryItem: (id) => api.delete(`/content/gallery/${id}`),
  faqs: () => api.get("/content/faqs"),
  adminFaqs: () => api.get("/content/faqs/all"),
  createFaq: (data) => api.post("/content/faqs", data),
  updateFaq: (id, data) => api.put(`/content/faqs/${id}`, data),
  deleteFaq: (id) => api.delete(`/content/faqs/${id}`),
  campaigns: () => api.get("/content/campaigns"),
  adminCampaigns: () => api.get("/content/campaigns/all"),
  createCampaign: (data) => api.post("/content/campaigns", data),
  updateCampaign: (id, data) => api.put(`/content/campaigns/${id}`, data),
  deleteCampaign: (id) => api.delete(`/content/campaigns/${id}`),
  popups: () => api.get("/content/popups"),
  adminPopups: () => api.get("/content/popups/all"),
  createPopup: (data) => api.post("/content/popups", data),
  updatePopup: (id, data) => api.put(`/content/popups/${id}`, data),
  deletePopup: (id) => api.delete(`/content/popups/${id}`),
  testimonials: () => api.get("/content/testimonials"),
  adminTestimonials: () => api.get("/content/testimonials/all"),
  createTestimonial: (data) => api.post("/content/testimonials", data),
  updateTestimonial: (id, data) => api.put(`/content/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/content/testimonials/${id}`),
};

export const adminService = {
  getStats: () => api.get("/admin/stats"),
  getAnalytics: () => api.get("/admin/analytics"),
  allCustomizations: () => api.get("/admin/customizations"),
};
