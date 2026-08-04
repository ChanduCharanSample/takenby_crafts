const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const upload = require("./middleware/upload");
const { storeFile } = require("./services/imageStorage");

dotenv.config();

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const optionalEnv = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "EMAIL_USER", "EMAIL_PASS", "CLIENT_URL"];
const missingRequired = requiredEnv.filter((k) => !process.env[k]);
const missingOptional = optionalEnv.filter((k) => !process.env[k]);
if (missingRequired.length) {
  console.error(`FATAL: Missing required env: ${missingRequired.join(", ")}`);
}
if (missingOptional.length) {
  console.warn(`Optional env not set: ${missingOptional.join(", ")}`);
}

connectDB();

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const configured = [
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
      ]
        .filter(Boolean)
        .map((u) => u.replace(/\/+$/, "").toLowerCase());
      const normalized = origin.replace(/\/+$/, "").toLowerCase();
      if (configured.length === 0 || configured.includes(normalized)) {
        return callback(null, origin);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/api/upload", (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    try {
      const stored = await storeFile(req.file);
      const url = stored.startsWith("http")
        ? stored
        : `${req.protocol}://${req.get("host")}/uploads/${stored}`;
      res.json({ success: true, url });
    } catch (error) {
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  });
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "TakenBy_Crafts API is running 🎨" });
});

const UserRouter = require("./routers/UserRouter");
const ProductRouter = require("./routers/ProductRouter");
const CategoryRouter = require("./routers/CategoryRouter");
const CartRouter = require("./routers/CartRouter");
const WishlistRouter = require("./routers/WishlistRouter");
const OrderRouter = require("./routers/OrderRouter");
const ReviewRouter = require("./routers/ReviewRouter");
const CustomizationRouter = require("./routers/CustomizationRouter");
const CouponRouter = require("./routers/CouponRouter");
const ContentRouter = require("./routers/ContentRouter");
const AdminRouter = require("./routers/AdminRouter");

app.use("/api/users", UserRouter);
app.use("/api/products", ProductRouter);
app.use("/api/categories", CategoryRouter);
app.use("/api/cart", CartRouter);
app.use("/api/wishlist", WishlistRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/reviews", ReviewRouter);
app.use("/api/customizations", CustomizationRouter);
app.use("/api/coupons", CouponRouter);
app.use("/api/content", ContentRouter);
app.use("/api/admin", AdminRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Craftora backend running on http://localhost:${PORT}`);
});
