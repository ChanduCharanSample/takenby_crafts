# 🧶 TakenBy_Crafts

> **Handmade with love, crafted for your special moments. 🤍**

**TakenBy_Crafts** is a full-stack e-commerce platform built for a real handmade crafts business. It provides customers with an easy way to discover handmade products, place orders, request custom creations, and connect with the brand.

The platform also provides a secure **Admin Dashboard** where the business owner can manage products, categories, orders, customers, website content, announcements, reels, FAQs, enquiries, and other store information without modifying the source code.

---

## ✨ Features

### 🛍️ Customer Features

- Browse handmade products
- Browse products by category
- Product search
- Product details
- Product image gallery
- Product sharing
- Add to Cart
- Wishlist
- Product reviews and ratings
- Customer registration
- Email OTP verification
- Customer login
- Forgot password
- Password reset through email
- Customer account
- Order placement
- Order history
- Order details
- Order status tracking
- Coupon support
- Custom order requests
- Reference image uploads for custom orders
- Contact form
- FAQs
- Responsive mobile-friendly interface

---

### 👩‍💼 Admin Features

The Admin Dashboard provides complete management of the business website.

#### Product Management

- Add products
- Edit products
- Delete products
- Upload product images
- Replace product images
- Product pricing
- Discounts
- Stock management
- Low-stock threshold
- Product categories
- Product flags
- Featured products
- Best sellers
- New arrivals
- Customizable products
- Personalized products

#### Order Management

- View orders
- View order details
- Update order status
- Manage customer orders
- Manage payment verification
- Track order progress

#### Customer Management

- View registered customers
- View customer information
- Manage customer accounts

#### Custom Orders

- View custom order requests
- Review customer requirements
- View uploaded reference images
- Manage customization requests
- Update custom order status

#### Content Management

Admin can update website content without changing source code:

- Homepage content
- Hero section
- Hero images
- Announcements
- Instagram reels
- Gallery
- FAQs
- About page
- Contact information
- Footer information
- Social media links
- Business information
- Website settings
- Logo
- Favicon

#### Other Management

- Categories
- Coupons
- Reviews
- Customer enquiries
- Inventory
- Website statistics
- Store settings

---

# 🎨 Product Categories

TakenBy_Crafts supports handmade collections including:

- 🌸 Resin Art
- 🪷 Preserved Flower Jewellery
- 🖼️ Photo Frames
- 🎁 Gift Hampers
- 🏡 Home Décor
- ☕ Resin Coasters
- 🎨 Clay Crafts
- 🧶 Crochet & Fiber Art
- 🌷 Pipe Cleaner Creations
- 💌 Vintage Letters
- 💝 Personalized Gifts
- ✨ Custom Orders

Categories and products can be managed from the Admin Dashboard.

---

# 🛠️ Tech Stack

## Frontend

- React 18
- Vite
- JavaScript
- React Router DOM
- Axios
- React Context API
- HTML5
- CSS3

## Backend

- Node.js
- Express.js
- REST API
- MVC Architecture
- Middleware-based authentication and authorization

## Database

- MongoDB
- Mongoose

The project can use local MongoDB during development and MongoDB Atlas for production.

## Authentication

- JWT
- bcrypt
- Email OTP verification
- Password reset
- Role-based authorization

## Email

- Nodemailer
- SMTP

## Image/File Handling

- Multer for backend uploads
- Production-ready external image storage configuration

---

# 📁 Project Structure

```text
TakenBy_Crafts/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── seed/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── README.md
├── ARCHITECTURE.md
├── .env.example
└── .gitignore
```

For the complete architecture and API documentation, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- Git
- MongoDB

For production, MongoDB Atlas can be used instead of a local MongoDB server.

Check your installation:

```bash
node -v
npm -v
git --version
```

---

# 📥 Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd TakenBy_Crafts
```

---

# 📦 Install Dependencies

## Frontend

```bash
cd frontend
npm install
```

## Backend

Open another terminal:

```bash
cd backend
npm install
```

---

# 🔐 Environment Variables

Sensitive information must **never** be committed to GitHub.

Create the required `.env` file using `.env.example` as a reference.

Example:

```env
MONGO_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
SMTP_HOST=
SMTP_PORT=
FRONTEND_URL=
```

Use the exact environment variable names defined in the current project.

### Never commit:

```text
.env
.env.local
.env.production
```

### Commit only:

```text
.env.example
```

The `.env.example` file must contain only safe placeholders.

---

# ▶️ Run Locally

## Start Backend

```bash
cd backend
npm run dev
```

## Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Use the scripts available in each `package.json` if the command names differ.

---

# 🏗️ System Architecture

```text
                    ┌───────────────────┐
                    │     Customer      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ React + Vite      │
                    │ Frontend          │
                    └─────────┬─────────┘
                              │
                           Axios
                              │
                              ▼
                    ┌───────────────────┐
                    │ Express REST API  │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
             Authentication       Authorization
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌───────────────────┐
                    │ Controllers /     │
                    │ Services          │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Mongoose Models   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ MongoDB           │
                    │ / MongoDB Atlas   │
                    └───────────────────┘
```

---

# 🛒 Customer Shopping Flow

```text
Browse Website
      ↓
Browse Categories
      ↓
View Products
      ↓
Product Details
      ↓
Add to Cart
      ↓
Checkout
      ↓
Place Order
      ↓
Order Confirmation
      ↓
Order Tracking
```

---

# 🎨 Custom Order Flow

```text
Customer
   ↓
Custom Orders
   ↓
Submit Requirements
   ↓
Upload Reference Images
   ↓
Admin Reviews Request
   ↓
Customization Discussion
   ↓
Order Processing
   ↓
Completed Order
```

---

# 📩 Contact Form Flow

```text
Customer
    ↓
Contact Form
    ↓
Express API
    ↓
MongoDB
    ↓
Admin Dashboard
    ↓
Admin Reviews Enquiry
```

Customer enquiries are stored so the Admin can review and manage them from the dashboard.

---

# 🔑 Authentication Flow

### Customer Registration

```text
Register
   ↓
Email OTP Sent
   ↓
OTP Verification
   ↓
Account Activated
   ↓
Login
   ↓
JWT Authentication
```

### Forgot Password

```text
Forgot Password
      ↓
Email
      ↓
Reset Link / Token
      ↓
New Password
      ↓
Login
```

Admin authentication is protected separately from normal customer access.

---

# 👩‍💼 Admin Dashboard

The Admin Dashboard is designed for the business owner to manage the complete website.

The Admin can manage:

```text
Products
Categories
Orders
Customers
Reviews
Custom Orders
Coupons
FAQs
Announcements
Instagram Reels
Gallery
Homepage
Contact Information
Footer
Social Links
Website Settings
Inventory
```

All normal business content should be manageable through the Admin Dashboard without modifying the source code.

---

# 🖼️ Image Management

Product and website images should be managed through the Admin Dashboard.

Admin can:

- Upload images
- Replace images
- Delete images
- Preview images
- Manage product galleries
- Update homepage images
- Update logo
- Update favicon
- Update announcement images
- Update gallery images

Production image storage should use the configured production storage service.

Sensitive storage credentials must be stored only in environment variables.

---

# 🔌 API

The backend provides REST APIs for the major application modules:

- Authentication
- Users
- Products
- Categories
- Cart
- Wishlist
- Orders
- Reviews
- Custom Orders
- Coupons
- FAQs
- Contact Messages
- Homepage Content
- Announcements
- Reels
- Gallery
- Admin Operations
- Website Settings

For the complete route and endpoint documentation, see:

**`ARCHITECTURE.md`**

---

# 🗄️ Database

Development can use:

```text
Local MongoDB
```

Production can use:

```text
MongoDB Atlas
```

The database connection must be provided through environment variables.

Example:

```env
MONGO_URI=<your-mongodb-connection-string>
```

Never hardcode database credentials in source code.

---

# 🌐 Production Deployment

The project is designed to support a production architecture such as:

```text
                  Customers
                      │
                      ▼
               ┌─────────────┐
               │  Frontend   │
               │   Hosting   │
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │   Backend   │
               │   Hosting   │
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │ MongoDB     │
               │ Atlas       │
               └─────────────┘
```

Production secrets must be configured through the hosting provider's environment-variable settings.

Do not put production credentials inside GitHub.

---

# 🔒 Security

Security is an important part of the project.

### Never commit:

- MongoDB passwords
- MongoDB connection strings containing credentials
- JWT secrets
- API keys
- SMTP passwords
- Cloud/storage credentials
- Deployment tokens
- Admin passwords
- Private customer information

### Recommended practices

- Store secrets in environment variables.
- Use strong production secrets.
- Use HTTPS in production.
- Protect admin routes.
- Validate user input.
- Hash passwords using bcrypt.
- Use JWT securely.
- Restrict database access.
- Keep dependencies updated.
- Rotate credentials if they are exposed.

### Important

If a password, API key, database credential, or other secret has already been pushed to GitHub, simply deleting it from the latest file is **not enough**.

The exposed credential should be revoked/rotated and, where necessary, removed from Git history.

---

# 📚 Documentation

## README.md

Provides:

- Project overview
- Features
- Tech stack
- Installation
- Setup
- Security information
- Development information

## ARCHITECTURE.md

Contains detailed technical documentation including:

- Frontend architecture
- Backend architecture
- Database models
- API routes
- Authentication flow
- Business flows
- Services
- Contexts
- Deployment configuration
- Environment variables
- Development decisions

## .env.example

Contains safe environment-variable placeholders without real credentials.

---

# 🧪 Development Guidelines

When adding a new feature:

1. Review the existing architecture.
2. Check whether an existing model can be reused.
3. Create/update the required database model.
4. Create/update the backend controller.
5. Add the API route.
6. Add validation.
7. Add authentication/authorization where required.
8. Add frontend API integration.
9. Add/update the frontend component or page.
10. Test customer functionality.
11. Test admin functionality.
12. Test error and empty states.
13. Test responsive layouts.
14. Verify the production build.
15. Update `ARCHITECTURE.md` when architecture changes.

---

# 🧹 Before Publishing to GitHub

Before making this repository public, verify that it contains no:

- `.env` files
- Database credentials
- JWT secrets
- API keys
- Email passwords
- Storage credentials
- Deployment tokens
- Admin credentials
- Customer personal information
- Private uploaded files

Make sure `.gitignore` contains:

```gitignore
.env
.env.*
!.env.example
node_modules/
dist/
build/
uploads/*
```

Only include upload folders if they are intended to be tracked and contain no private information.

---

# 🤝 Contributing

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Make your changes and test them.

Commit:

```bash
git add .
git commit -m "Add your feature"
```

Push:

```bash
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 💕 About TakenBy_Crafts

**TakenBy_Crafts** is a handmade craft brand focused on creating personalized gifts, meaningful memories, and handcrafted keepsakes.

Our collections include:

- Resin Art
- Preserved Flower Jewellery
- Photo Frames
- Gift Hampers
- Personalized Gifts
- Clay Crafts
- Crochet & Fiber Art
- Pipe Cleaner Creations
- Home Décor
- Vintage Letters
- Custom Orders

Every creation is thoughtfully handmade with creativity, care, and love.

---

# 🎯 Project Goal

The goal of TakenBy_Crafts is to provide a complete digital storefront for a handmade business while keeping the platform simple to manage.

Customers can discover and order handmade products online, while the business owner can manage products, orders, content, customers, and website updates through the Admin Dashboard.

---

# 📄 License

License information has not yet been specified.

---

<div align="center">

### Made with ❤️ for TakenBy_Crafts

**Handmade with love. Crafted for your special moments.**

</div>
