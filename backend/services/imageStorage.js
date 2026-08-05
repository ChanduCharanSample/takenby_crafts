const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const { Jimp, JimpMime } = require("jimp");

const uploadDir = path.join(__dirname, "..", "uploads");

// Resize/compress an image buffer. Returns null when it should be left untouched
// (already small, unsupported format like SVG/ICO, or the result isn't smaller).
const MAX_IMAGE_WIDTH = 1000;
const MIN_COMPRESS_BYTES = 200 * 1024;

const compressBuffer = async (buffer) => {
  try {
    if (!buffer || !buffer.length) return null;
    if (buffer.length < MIN_COMPRESS_BYTES) return null;
    const image = await Jimp.read(buffer);
    if (!image) return null;
    if (image.width > MAX_IMAGE_WIDTH) {
      image.resize({ w: MAX_IMAGE_WIDTH });
    }
    const hasAlpha = typeof image.hasAlpha === "function" && image.hasAlpha();
    const out = hasAlpha
      ? await image.getBuffer(JimpMime.png)
      : await image.getBuffer(JimpMime.jpeg, { quality: 80 });
    if (out.length >= buffer.length) return null;
    return { buffer: out, mime: hasAlpha ? "image/png" : "image/jpeg" };
  } catch (error) {
    return null;
  }
};

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
// otherwise a base64 data URI persisted in MongoDB (survives Render restarts).
const storeFile = async (file) => {
  if (!file) return "";
  if (!isCloudinaryConfigured()) {
    try {
      const raw = fs.readFileSync(file.path);
      const compressed = await compressBuffer(raw);
      const data = compressed ? compressed.buffer : raw;
      const mime = compressed ? compressed.mime : file.mimetype;
      fs.unlink(file.path, () => {});
      return `data:${mime};base64,${data.toString("base64")}`;
    } catch (error) {
      console.error("Local read failed, falling back to filename:", error.message);
      return file.filename;
    }
  }

  try {
    const compressed = await compressBuffer(fs.readFileSync(file.path));
    const result = await cloudinary.uploader.upload(compressed ? compressed.buffer : file.path, {
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
  if (value.startsWith("data:")) return;
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
  compressBuffer,
};
