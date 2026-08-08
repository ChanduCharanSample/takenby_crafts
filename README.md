TakenBy_Crafts

TakenBy_Crafts is a full-stack handmade crafts e-commerce platform for discovering, purchasing, and requesting customized handmade products such as resin art, preserved flower jewellery, photo frames, gift hampers, crochet & fiber art, clay crafts, and home décor.

✨ Features

Customer

Browse and search products

Shop by category

Product details and stock information

Cart and wishlist

Customer authentication and account

Checkout and order management

Custom order requests

Coupons and discounts

Contact/customer enquiries

FAQs

Order tracking/status

Admin

Admin dashboard

Product and category management

Inventory and pricing management

Order management

Customer management

Custom order management

FAQ management

Coupon/discount management

Customer enquiry management

Store/content management

Product image management

🛠️ Tech Stack

Frontend: React, Vite, JavaScript, HTML, CSS

Backend: Node.js, Express.js, REST APIs

Database: MongoDB, Mongoose

Authentication: JWT-based authentication and protected/admin routes

Deployment: Separate frontend/backend deployment architecture

Only technologies and services actually present in the repository should be added to this list.

📁 Project Structure

TakenBy_Crafts/
├── frontend/
├── backend/
├── README.md
├── ARCHITECTURE.md
├── .env.example
└── .gitignore

See ARCHITECTURE.md for the complete repository structure.

🚀 Getting Started

Prerequisites

Node.js

npm

MongoDB or a MongoDB deployment

Git

Check versions:

node -v
npm -v

Clone

git clone <YOUR_PUBLIC_REPOSITORY_URL>
cd TakenBy_Crafts

Install dependencies

cd frontend
npm install

cd ../backend
npm install

Use the scripts defined in each package.json.

🔐 Environment Variables

Sensitive configuration must never be committed to GitHub.

Create environment files using .env.example as the template. Use the exact variable names required by the current codebase.

Example:

MONGODB_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASSWORD=

Do not place real credentials in this README.

Never commit:

.env
.env.local
.env.production

Commit only the safe template:

.env.example

▶️ Run Locally

Backend

cd backend
npm run dev

Frontend

In another terminal:

cd frontend
npm run dev

If the repository uses different scripts, follow the corresponding package.json.

🏗️ Architecture

Customer / Admin
       ↓
React + Vite Frontend
       ↓
REST API
       ↓
Express Middleware
       ├── Authentication
       ├── Authorization
       ├── Validation
       └── Error Handling
       ↓
Controllers / Services
       ↓
Mongoose Models
       ↓
MongoDB

🛒 Main Business Flows

Shopping

Browse Products
      ↓
Product Details
      ↓
Cart
      ↓
Checkout
      ↓
Order
      ↓
Order Management

Custom Orders

Customer
   ↓
Custom Order Request
   ↓
Admin Review
   ↓
Customization / Communication
   ↓
Order Processing

Customer Contact

Contact Form
      ↓
Backend API
      ↓
Database / Admin

🔌 API

The backend provides APIs for areas such as:

Authentication

Products

Categories

Cart

Wishlist

Orders

Custom orders

Coupons

FAQs

Customer enquiries

Admin operations

Store/content management

For the complete endpoint reference, see ARCHITECTURE.md.

👩‍💼 Admin

The admin area is protected by authentication and authorization.

Administrators can manage products, categories, orders, customers, custom requests, FAQs, coupons, enquiries, and store content.

Never publish admin usernames, passwords, JWT secrets, or other credentials in this repository.

🔒 Security

Never commit .env files.

Never expose API keys or database credentials.

Never expose JWT secrets.

Never commit admin passwords.

Store secrets in environment variables.

Use HTTPS in production.

Keep dependencies updated.

Restrict database access appropriately.

Use strong production secrets.

Rotate any credential that becomes exposed.

If a secret has already been pushed to a public repository, simply deleting it from the latest file is not enough. Revoke/rotate the exposed credential and remove it from Git history where appropriate.

📚 Documentation

README.md — project overview and setup

ARCHITECTURE.md — detailed technical architecture, routes, models, business flows, deployment and development information

.env.example — safe environment-variable template

🤝 Contributing

Create a branch:

git checkout -b feature/your-feature

Make and test your changes.

Commit:

git add .
git commit -m "Add your feature"

Push the branch:

git push origin feature/your-feature

Open a Pull Request.

📌 Before Publishing to GitHub

Verify that the repository contains no:

Database passwords

MongoDB connection strings with credentials

JWT secrets

API keys

SMTP/email passwords

Cloud/storage credentials

Deployment tokens

Admin passwords

Private customer information

💕 About TakenBy_Crafts

TakenBy_Crafts is a handmade craft brand focused on personalized gifts, memories, and keepsakes made with care.

The platform brings handmade creations such as resin art, preserved flowers, customized photo frames, gift hampers, crochet creations, clay crafts, and décor into one online shopping experience.

📄 License

License information has not yet been specified.

Made with ❤️ for TakenBy_Crafts
