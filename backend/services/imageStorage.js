const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");

const isCloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
     process.env.CLOUDINARY_API_KEY &&
     process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Store a single multer file.
// Returns a Cloudinary secure URL when Cloudinary is configured,
// otherwise the local filename (dev fallback).
const storeFile = async (file) => {
  if (!file) return "";
  if (!isCloudinaryConfigured()) return file.filename;

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "craftora",
      resource_type: "image",
    });
    fs.unlink(file.path, () => {});
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed, using local:", error.message);
    return file.filename;
  }
};

// Store multiple multer files sequentially.
const storeFiles = async (files) => {
  if (!files || !files.length) return [];
  const results = [];
  for (const file of files) {
    results.push(await storeFile(file));
  }
  return results;
};

// Extract the public id (minus version prefix) from a Cloudinary secure URL.
const getPublicId = (url) => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const idx = parts.indexOf("upload");
    if (idx === -1) return null;
    let publicId = parts.slice(idx + 1).join("/");
    publicId = publicId.replace(/^v\d+\//, "");
    return publicId || null;
  } catch (e) {
    return null;
  }
};

// Delete a stored image value (Cloudinary URL or local filename).
const deleteImage = async (value) => {
  if (!value) return;
  if (isCloudinaryConfigured() && /^https?:\/\//.test(value)) {
    const publicId = getPublicId(value);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Cloudinary delete failed:", error.message);
      }
    }
    return;
  }
  const filePath = path.join(uploadDir, path.basename(value));
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}
  }
};

module.exports = {
  isCloudinaryConfigured,
  storeFile,
  storeFiles,
  deleteImage,
  getPublicId,
};
