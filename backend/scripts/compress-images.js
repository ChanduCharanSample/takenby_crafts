// One-time migration: compress oversized base64 images stored in MongoDB.
// Usage: node scripts/compress-images.js   (uses MONGO_URI env)
require("dotenv").config();
const mongoose = require("mongoose");
const { compressBuffer } = require("../services/imageStorage");

const compressDataUri = async (dataUri) => {
  if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:")) return dataUri;
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(dataUri);
  if (!match) return dataUri;
  const raw = Buffer.from(match[2], "base64");
  const compressed = await compressBuffer(raw);
  if (!compressed) return dataUri;
  return `data:${compressed.mime};base64,${compressed.buffer.toString("base64")}`;
};

const TARGETS = [
  { col: "categories", fields: ["image"] },
  { col: "products", fields: ["coverImage", "images"] },
  { col: "settings", fields: ["logo", "favicon", "qrCode"] },
  { col: "announcements", fields: ["image"] },
  { col: "about", fields: ["galleryImages", "workshopImages", "stallPhotos"] },
  { col: "gallery", fields: ["image"] },
  { col: "homepage", fields: ["hero.image", "festivalBanner.image", "personalizedImage"] },
  { col: "reels", fields: ["thumbnail"] },
  { col: "testimonials", fields: ["photo"] },
  { col: "popups", fields: ["image"] },
  { col: "customizations", fields: ["referenceImage"] },
  { col: "reviews", fields: ["image", "images"] },
  { col: "users", fields: ["profileImage"] },
];

const getVal = (doc, dot) => dot.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), doc);

const setVal = (doc, dot, val) => {
  const keys = dot.split(".");
  let o = doc;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!o[keys[i]]) o[keys[i]] = {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = val;
};

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is required");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });
    const db = mongoose.connection.db;
    let grandSaved = 0;

    for (const { col, fields } of TARGETS) {
      const coll = db.collection(col);
      const projection = { _id: 1 };
      fields.forEach((f) => { projection[f] = 1; });
      const ids = await coll.find({}, { projection: { _id: 1 } }).toArray();
      let saved = 0;
      for (const { _id } of ids) {
        const doc = await coll.findOne({ _id }, { projection });
        const set = {};
        for (const field of fields) {
          const val = getVal(doc, field);
          if (Array.isArray(val)) {
            const out = [];
            let changed = false;
            for (const item of val) {
              const compressed = typeof item === "string" ? await compressDataUri(item) : item;
              if (compressed !== item) changed = true;
              out.push(compressed);
            }
            if (changed) set[field] = out;
          } else if (typeof val === "string") {
            const compressed = await compressDataUri(val);
            if (compressed !== val) set[field] = compressed;
          }
        }
        if (Object.keys(set).length) {
          await coll.updateOne({ _id }, { $set: set });
          saved++;
        }
      }
      console.log(`${col}: processed ${ids.length} docs, updated ${saved}`);
      grandSaved += saved;
    }

    console.log("Migration complete. Docs updated:", grandSaved);
    await mongoose.disconnect();
  } catch (e) {
    console.error("MIGRATION FAILED:", e.message);
    process.exit(1);
  }
})();