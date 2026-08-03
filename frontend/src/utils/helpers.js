export const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("data:") || image.startsWith("http")) return image;
  return `/uploads/${image}`;
};

export const formatPrice = (amount) => {
  const num = Number(amount) || 0;
  return "₹" + num.toLocaleString("en-IN");
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const discountPercent = (product) => {
  if (!product || !product.discount) return 0;
  return product.discount;
};

export const finalPrice = (product) => {
  if (!product) return 0;
  return Math.round(product.price - (product.price * (product.discount || 0)) / 100);
};
