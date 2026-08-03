# takenby_crafts

# CRAFTORA — Handmade Arts & Crafts E-Commerce

A complete, full-stack e-commerce platform for buying and selling handmade arts & crafts. Built with the MERN stack (MongoDB, Express, React, Node.js) using plain JavaScript — no TypeScript, no CSS frameworks. Fully responsive, role-based (customer / seller / admin), and beginner-friendly.

![Stack](https://img.shields.io/badge/stack-MERN-orange) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Customers
- Browse the shop with **search, category filters, sorting** and pagination
- Product detail pages with rating & review system
- **Shopping cart** with quantity management and **discount coupons**
- **Wishlist** for saving favorite crafts
- Checkout via **Cash on Delivery** (Razorpay online-payment placeholder is included and degrades gracefully when not configured)
- **Order tracking** with a status timeline (Placed → Confirmed → Shipped → Delivered → Completed)
- Order cancellation and **re-order** (one-click)
- Submit **custom craft requests** (customization orders) and track their approval/price/status
- Review products after delivery; reviews verified vs. unverified
- Register / login / profile management

### Sellers
- Dashboard with key stats
- Product management: create, edit, delete, **inventory/stock** updates
- View and fulfill orders (confirm → ship → deliver)
- Manage incoming **customization requests** (approve, set price)
- Reviews on their products, and a sales analytics page

### Admin
- Global dashboard with stats & charts
- Manage **users, sellers, products, categories, orders, reviews, coupons, custom requests**
- Coupon CRUD (name, code, discount %, validity, usage limits)

### Platform
- JWT-based authentication & role-based route protection (401/403)
- File uploads via Multer (jpeg/png/webp, 5 MB) stored under `backend/uploads/`
- Toast notifications, loading spinners, empty states
- Fully responsive design (desktop / tablet / mobile breakpoints)

---

## Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React 18, React Router DOM, Axios, React Icons, Vite |
| Backend   | Node.js, Express, Mongoose                    |
| Database  | MongoDB (local)                              |
| Auth      | JSON Web Tokens (JWT) + bcryptjs             |
| Uploads   | Multer                                       |
| Payments  | Razorpay (optional placeholder)              |

---

## Folder Structure

```
craftora/
├── backend/
│   ├── config/db.js
│   ├── controllers/      # 10 controllers (user, product, cart, order, ...)
│   ├── middleware/       # auth, role, error handler, upload
│   ├── models/           # 9 Mongoose models
│   ├── routers/          # 10 routers
│   ├── seed/seed.js      # seed data (categories, products, users, coupons)
│   ├── uploads/          # uploaded product images (git-ignored)
│   ├── .env              # environment variables
│   ├── .env.example
│   └── server.js         # entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, ProductCard, Spinner, etc.
│   │   ├── contexts/     # Auth, Cart, Wishlist, Toast
│   │   ├── pages/        # public + customer pages
│   │   ├── pages/seller/ # seller dashboard pages
│   │   ├── pages/admin/  # admin dashboard pages
│   │   ├── services/     # typed API wrappers per feature
│   │   ├── styles/index.css
│   │   └── App.jsx
│   └── package.json
├── README.md
└── .gitignore
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) **v18+** (tested on v22)
- [MongoDB](https://www.mongodb.com/) running locally on the default port (`27017`)

---

## Installation

### 1. Clone & install dependencies

```bash
git clone <your-repo-url> craftora
cd craftora

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend environment

Create `backend/.env` (or copy `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/craftora
JWT_SECRET=craftora_super_secret_change_me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
# Optional Razorpay (leave placeholders to use demo checkout fallback)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
```

> `JWT_SECRET` is used to sign tokens. **Change it** before deploying.

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates **12 categories, 22 products, 5 users, 3 coupons**. It skips if data already exists. To wipe and re-seed: `npm run seed -- --destroy`.

### 4. Start the backend

```bash
cd backend
npm run dev        # nodemon (auto-reload) — or `npm start` / `node server.js`
```

Backend runs on **http://localhost:5000**.

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173** (Vite proxies `/api` and `/uploads` to the backend).

---

## Demo Accounts

| Role     | Email                 | Password    |
|----------|-----------------------|-------------|
| Admin    | `admin@craftora.com`  | `admin123`  |
| Seller 1 | `seller@craftora.com` | `seller123` |
| Seller 2 | `seller2@craftora.com`| `seller123` |
| Customer | `customer@craftora.com` | `customer123` |

> Customer accounts registered through the UI are given the **customer** role automatically.

## Demo Coupons

| Code        | Discount |
|-------------|----------|
| `CRAFT10`   | 10%      |
| `WELCOME20` | 20%      |
| `FESTIVE15` | 15%      |

---

## API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint                          | Auth    | Description                        |
|--------|-----------------------------------|---------|------------------------------------|
| POST   | `/users/register`                 | –       | Register a new user                |
| POST   | `/users/login`                    | –       | Login, returns JWT                 |
| GET    | `/users/profile`                  | User    | Current profile                    |
| PUT    | `/users/profile`                  | User    | Update profile                     |
| GET    | `/products`                       | –       | List products (search/filter/sort/pagination) |
| GET    | `/products/:id`                   | –       | Product details                    |
| GET    | `/categories`                     | –       | All categories                     |
| GET/POST | `/cart`, `/cart`                | User    | Get / add to cart                  |
| PUT    | `/cart/:itemId`                   | User    | Update cart item quantity           |
| DELETE | `/cart/:itemId`                   | User    | Remove cart item                    |
| GET/POST | `/wishlist`, `/wishlist`        | User    | Get / add to wishlist               |
| POST   | `/orders`                         | User    | Place order (COD / Razorpay)       |
| GET    | `/orders/my-orders`               | User    | My orders                          |
| POST   | `/reviews`                        | User    | Review a delivered product          |
| POST   | `/customizations`                 | User    | Submit a custom craft request       |
| GET    | `/coupons/validate/:code`         | User    | Validate a coupon                   |
| ...    | seller/admin routers              | Seller/Admin | Dashboard & management endpoints |

Routers are mounted under: `/api/users`, `/api/products`, `/api/categories`, `/api/cart`, `/api/wishlist`, `/api/orders`, `/api/reviews`, `/api/customizations`, `/api/coupons`, `/api/admin`.

---

## Testing

- **Backend endpoints**: the seed + controllers were verified with real HTTP requests (register, login, cart, coupon, order place/cancel, wishlist, customization approval flow, admin stats/analytics, role protection, review lifecycle).
- **Frontend rendering**: every public page and every protected page (customer, seller, admin dashboards) was rendered in headless Chrome via Puppeteer and confirmed free of runtime errors.
- **Production build**: `npm run build` in `frontend/` completes successfully (Vite).

---

## License

MIT