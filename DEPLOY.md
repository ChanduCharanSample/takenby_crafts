# Deploying TakenBy_Crafts (Craftora)

This guide deploys the app with zero architecture changes:
- **Frontend** → Vercel (React + Vite)
- **Backend** → Render (Node/Express)
- **Database** → MongoDB Atlas (env-only switch; `config/db.js` already uses `MONGO_URI`)
- **Images** → Cloudinary (full URLs stored in MongoDB; works everywhere)
- **OTP/Order emails** → Gmail SMTP (already wired via Nodemailer)

---

## 1. One-time prep

### MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Add a **Database User** (username/password) and allow access from **0.0.0.0/0** (or your IP).
3. Click **Connect → Drivers → Node.js**, copy the connection string:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
4. Append your database name (e.g. `...mongodb.net/craftora?retryWrites=true&w=majority`).
   This value becomes `MONGO_URI` in the backend env.

### Cloudinary
1. Sign up free at https://cloudinary.com.
2. From the Dashboard copy `Cloud name`, `API Key`, `API Secret`.
   These become `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Gmail SMTP (for order confirmations / OTPs)
1. Enable 2-Step Verification on the Gmail account.
2. Create an **App Password** at https://myaccount.google.com/apppasswords.
   This becomes `EMAIL_PASS`.

---

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/craftora.git
git push -u origin main
```

> `.gitignore` already excludes `node_modules/`, `backend/.env`, `frontend/dist/`, and `backend/uploads/*`.

---

## 3. Deploy backend → Render

1. Go to https://render.com → **New → Blueprint** (or **New → Web Service**).
2. Connect your GitHub repo.
3. If using the included `backend/render.yaml` blueprint, Render auto-fills the service (root dir `backend`, start `npm start`).
   Otherwise create a **Web Service** manually:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add these **Environment Variables**:

| Variable | Value |
|---|---|
| `MONGO_URI` | Your Atlas connection string (with `/craftora`) |
| `JWT_SECRET` | A long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://<your-vercel-app>.vercel.app` (after step 4) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `EMAIL_USER` | Gmail address for OTP/order mail |
| `EMAIL_PASS` | Gmail app password |
| `EMAIL_FROM` | Gmail address |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` |
| `PORT` | Render sets this automatically (leave unset) |

5. Deploy. Wait for the health endpoint: `https://<backend>.onrender.com/` should return the API banner JSON.
   **Copy this backend URL** (e.g. `https://craftora-backend.onrender.com`) — you need it in step 4.

> **Important:** Once `CLOUDINARY_*` are set, every uploaded image is stored on Cloudinary and a
> full `https://` URL is saved to the DB. When they are empty (local dev), files stay in
> `backend/uploads/`. No other code changes between environments.

---

## 4. Deploy frontend → Vercel

1. Go to https://vercel.com → **Add New Project** → import your GitHub repo.
2. Framework preset: **Vite**. Root directory: `frontend`. Build: `npm run build`, Output: `dist`.
3. Add the environment variable:
   - `VITE_API_URL` = `https://<your-backend>.onrender.com`
4. Deploy. Your site is live at `https://<your-vercel-app>.vercel.app`.
5. Go back to **Render** and set `CLIENT_URL` and `FRONTEND_URL` to the Vercel URL, then redeploy the backend.

> `frontend/vercel.json` is included so React Router works on refresh (SPA rewrites).
> The default `vercel.json` rewrites all routes to `index.html`.

---

## 5. Migrate existing local data to Atlas

After the Atlas cluster is up and the Render backend is configured with `MONGO_URI=atlas`:

Option A — copy data from your local MongoDB (recommended):
```bash
cd backend
# in backend/.env add: TARGET_MONGO_URI=<your atlas connection string>
npm run migrate
```

Option B — empty start on Atlas:
Run the seed once against Atlas (creates admin, customers, sample products):
```bash
cd backend
# temporarily set MONGO_URI=<atlas> in backend/.env
npm run seed
```

> All existing image values in the DB are `data:` URIs or URLs, so no local files need to move.
> Uploaded images created AFTER deploy are stored on Cloudinary automatically.

---

## 6. Verify (checklist)

- [ ] `MONGO_URI` change only — `config/db.js` reads env, no hardcoded URLs anywhere
- [ ] Admin login works on Render (`/api/users/admin-login`)
- [ ] Products / categories / coupons / content CRUD work from the admin dashboard
- [ ] Upload an image (product, category, logo, gallery, announcement, campaign, popup, testimonial) and confirm it is stored as a `res.cloudinary.com` URL in Atlas, and displays on the site
- [ ] Homepage, footer, announcements, campaigns, popups update instantly (all DB-backed)
- [ ] Orders / accounts / reviews work; OTP and order emails arrive via Gmail SMTP
- [ ] Refresh any page on Vercel → still renders (SPA rewrite works)
- [ ] Local dev still works with `VITE_API_URL` empty + `CLOUDINARY_*` empty

---

## 7. Redeploy flow (zero code changes)

All content is CMS-managed from Admin → no redeploys needed after launch:
products, categories, homepage, announcements, festival campaigns, popups, reels, gallery,
testimonials, FAQs, footer, contact, business info/hours, social links, logo, UPI QR/ID,
delivery charges, coupons, settings — all persisted in Atlas, images in Cloudinary.
