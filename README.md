# KINORA Luxury Maison — Admin Panel

A modern, responsive, and production-ready Admin Panel for **KINORA** built with **React, TypeScript, Vite, Tailwind CSS, Firebase Authentication & Firestore, and Cloudinary**.

Designed in accordance with the official KINORA brand identity: **Black (`#09090B`), Gold (`#D4AF37`), and White (`#FFFFFF`)**.

---

## Features Overview

### 1. Brand & Aesthetic
- Official KINORA Logo integration (using the preserved `LOGO.png` project asset).
- Luxury high-end obsidian dark theme with opulent gold highlights and subtle gold glows.
- Fully responsive across desktop, tablet, and mobile devices with collapsible navigation and drawers.

### 2. Authentication & Role-Based Authorization
- **Firebase Authentication**:
  - Google / Gmail One-Click Sign-In
  - Email + Password Sign-In
  - Password Reset workflow
- **Role Verification**:
  - Enforced role checking in Firestore (`admins/{uid}` or `users/{uid}.role === 'admin'`).
  - Strict security rules in `firestore.rules` preventing customers from modifying products, orders, banners, coupons, or settings.
  - One-click Demo Admin mode for immediate review and testing without waiting for live keys.

### 3. Product Catalog & Cloudinary Imagery
- **Product Management**:
  - Add, Edit, Delete luxury products.
  - Price, Discounted Price, Stock level, and custom SKU.
  - Product status (`active`, `draft`, `out_of_stock`) and Featured showcase toggle.
  - Dynamic variant manager (Sizes, Colors, Finishes, Metal types).
- **Secure Cloudinary System**:
  - Direct file upload from device with drag-and-drop and progress indicator.
  - Add images via URL with instant preview.
  - Primary image selection with luxury gold badge.
  - Image lightbox preview and deletion.
  - **Zero Secret Exposure**: Uses Cloudinary Unsigned Upload Presets so the API Secret is never exposed to frontend code.

### 4. Comprehensive Admin Modules
- **Dashboard**: Real-time KPI cards (Sales/Revenue, Orders, Products, Customers), interactive revenue charts (Monthly / Weekly), fulfillment pipeline progress bars, recent VIP acquisitions, and low-stock alerts.
- **Categories & Subcategories**: Visual cards, cover imagery, slug generation, and subcategory tag management.
- **Order Management**: Status-based tab filtering (`All`, `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), customer contact details, tracking number updates, and printable invoice views.
- **Customer Directory**: VIP patron profiles, lifetime spend, order count, and account suspension/activation.
- **Promotional Banners**: Hero sliders, top announcement strips, and promotional highlights with start/end schedule dates.
- **Coupons & Privilege Codes**: Percentage and fixed discount codes with minimum cart requirements, usage limits, and expiration dates.
- **Admin Notifications**: Real-time notifications for high-value orders, stock depletion, and new VIP registrations.
- **Store Settings & Admin Profile**: Flagship contact info, currency, tax rate, white-glove shipping thresholds, maintenance mode, and a **One-Click Firestore Demo Data Seeder**.

---

## Environment Setup

Create a `.env` file in the project root (copied from `.env.example`):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
# Use an "Unsigned" upload preset (never expose API secret!)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset

# Optional Default Admin Email
VITE_DEFAULT_ADMIN_EMAIL=admin@kinora.com
```

### Setting up Cloudinary (1 Minute):
1. Sign up or log into [Cloudinary](https://cloudinary.com/).
2. Navigate to **Settings > Upload > Upload presets**.
3. Click **Add upload preset**.
4. Set **Signing Mode** to **Unsigned**.
5. Set the folder to `kinora/products`.
6. Save and copy the preset name into `VITE_CLOUDINARY_UPLOAD_PRESET`.

### Setting up Firebase Firestore & Auth:
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google provider and Email/Password provider).
3. Enable **Cloud Firestore** and deploy `firestore.rules`.
4. Copy your web app config keys into `.env`.
5. In the KINORA Admin Panel, go to `/admin/settings` and click **"Seed Sample Data"** to immediately populate your database!

---

## Development & Build Commands

```bash
# Run local development server
npm run dev

# Build for production (TypeScript check + Vite bundle)
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment (Vercel Ready)

This repository includes `vercel.json` configured for SPA routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

To deploy:
1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com/).
3. Add the environment variables from your `.env` into Vercel's Project Settings.
4. Deploy!
