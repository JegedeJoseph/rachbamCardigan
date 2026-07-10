# 🧥 Naira Cardigans
> **A premium, modern e-commerce platform built for the seamless sale of luxury cardigans in Nigeria.**

---

## 🌟 What is Naira Cardigans?

**For the Shopper:**
Naira Cardigans is a sleek, lightning-fast online storefront designed to provide a premium shopping experience. Customers can browse high-quality cashmere cardigans, view rich image galleries, select their perfect size and color, and securely pay using their local currency (₦) via Paystack. 

**For the Business Owner:**
Behind the scenes, Naira Cardigans features a powerful, secure Admin Dashboard. Business owners can effortlessly manage product inventory, track real-time stock levels, configure shipping rates across all 36 Nigerian states, and view beautiful analytics dashboards to track daily sales and revenue.

---

## ✨ Key Features

### 🛍️ Storefront Experience (UX/UI)
* **Responsive Design:** Flawless shopping experience on mobile, tablet, and desktop.
* **Rich Product Details:** Image galleries, detailed sizing, and social proof.
* **Frictionless Checkout:** Guest checkout flow with instant Paystack payment verification.
* **Order Tracking:** Customers can track their orders through processing, shipping, and delivery stages.

### 💼 Admin & Business Tools
* **Dynamic Inventory:** Create products with multiple variants (Size/Color) and track stock independently.
* **Smart Shipping:** Dynamic shipping cost calculation based on the customer's state.
* **Order Management:** View, fulfill, and update order statuses in real-time.
* **Sales Analytics:** Visual dashboard showing total revenue, recent orders, and top-selling products.

### 💻 Technical Highlights
* **Robust Backend:** Built on Node.js & Express with a secure MongoDB database.
* **Cloud Infrastructure:** Cloudinary integration for lightning-fast image delivery.
* **Webhooks:** Automated Paystack webhooks to verify transactions and instantly deduct stock.
* **Type Safety:** Zod validation on all API endpoints to guarantee data integrity.

---

## 🚀 Getting Started (For Developers)

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for image hosting)
- Paystack Account (for payments)
- Firebase Account (for Google Auth)

### 1. Installation
Clone the repository and install both server and client dependencies:
```bash
git clone <repository-url>
cd rachbamCardigan

# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Variables
Create a `.env` file in the root directory and configure the following:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/naira-cardigans

# Authentication
JWT_SECRET=your_super_secret_key

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack (Payments)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# App Configuration
PORT=10000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run the Platform
Start both the React frontend and Node backend concurrently:
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend:** `http://localhost:10000`

---

## 🏗️ Architecture & Structure

```text
rachbamCardigan/
├── client/                 # Frontend React Application
│   ├── src/components/     # Reusable UI elements (Store & Admin)
│   ├── src/pages/          # Page layouts (Checkout, Dashboard, etc.)
│   ├── src/context/        # Global state (Cart, Auth)
│   └── src/services/       # API integration layers
├── server/                 # Backend Node.js/Express Application
│   ├── models/             # MongoDB Mongoose Schemas
│   ├── routes/             # RESTful API endpoints
│   ├── repositories/       # Database access layer (abstraction)
│   ├── services/           # Third-party integrations (Paystack, Cloudinary)
│   └── index.js            # Server entry point
```

---

## 🌐 Deployment

Naira Cardigans is optimized for deployment on modern cloud platforms like Render, Vercel, or traditional VPS (like Whogohost). 

**Production Checklist:**
1. Secure all `.env` variables in your hosting dashboard.
2. Ensure your Paystack Webhook URL points to `https://your-live-domain.com/api/webhooks/paystack`.
3. Set `NODE_ENV=production`.

---
*Built with ❤️ for the modern Nigerian e-commerce ecosystem.*
