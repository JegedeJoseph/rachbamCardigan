# Setup Checklist

Use this checklist to ensure your Naira Cardigans admin dashboard is properly configured.

## 📋 Pre-Installation

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Git installed (optional)
- [ ] Code editor (VS Code recommended)

## 🔧 Installation Steps

### 1. Dependencies
- [ ] Run `npm install` in root directory
- [ ] Run `cd client && npm install`
- [ ] Verify no installation errors

### 2. MongoDB Setup

**Option A: Local MongoDB**
- [ ] MongoDB installed locally
- [ ] MongoDB service running
- [ ] Can connect to `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Recommended)**
- [ ] Created MongoDB Atlas account
- [ ] Created a cluster
- [ ] Created database user
- [ ] Whitelisted IP (0.0.0.0/0 for development)
- [ ] Copied connection string

### 3. Cloudinary Setup
- [ ] Created Cloudinary account at cloudinary.com
- [ ] Noted Cloud Name
- [ ] Noted API Key
- [ ] Noted API Secret
- [ ] Tested credentials (optional)

### 4. Paystack Setup
- [ ] Created Paystack account at paystack.com
- [ ] Completed business verification (for live keys)
- [ ] Copied Test Secret Key (starts with `sk_test_`)
- [ ] Copied Test Public Key (starts with `pk_test_`)
- [ ] Noted Live keys for production (starts with `sk_live_` and `pk_live_`)

### 5. Environment Configuration
- [ ] Copied `.env.example` to `.env`
- [ ] Updated `MONGODB_URI` with your connection string
- [ ] Updated `CLOUDINARY_CLOUD_NAME`
- [ ] Updated `CLOUDINARY_API_KEY`
- [ ] Updated `CLOUDINARY_API_SECRET`
- [ ] Updated `PAYSTACK_SECRET_KEY`
- [ ] Updated `PAYSTACK_PUBLIC_KEY`
- [ ] Verified `PORT` is set (default: 5000)
- [ ] Verified `CLIENT_URL` is set (default: http://localhost:5173)

## 🧪 Testing

### 6. Initial Test
- [ ] Run `npm run dev`
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can access http://localhost:5000/api/health
- [ ] No console errors in browser

### 7. Database Test
- [ ] Run `npm run seed` to add sample data
- [ ] Verify 3 products created
- [ ] Verify 10 shipping rates created
- [ ] Check MongoDB for data (optional)

### 8. Feature Testing

**Dashboard**
- [ ] Navigate to Dashboard
- [ ] See analytics cards
- [ ] No errors in console

**Products**
- [ ] Navigate to Products page
- [ ] See sample products (if seeded)
- [ ] Click "Add Product"
- [ ] Form opens correctly

**Create Product**
- [ ] Fill in product name
- [ ] Fill in description
- [ ] Set price (e.g., 15000)
- [ ] Add variant (size: Large, color: Burgundy, stock: 25)
- [ ] Click "Add" to add variant
- [ ] Variant appears in list
- [ ] Upload an image (optional - requires Cloudinary)
- [ ] Click "Create Product"
- [ ] Product appears in grid
- [ ] No errors

**Edit Product**
- [ ] Click "Edit" on a product
- [ ] Form pre-fills with product data
- [ ] Change price
- [ ] Click "Update Product"
- [ ] Changes saved successfully

**Delete Product**
- [ ] Click "Delete" on a product
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Product removed from list

**Shipping Rates**
- [ ] Navigate to Shipping Rates
- [ ] See sample rates (if seeded)
- [ ] Click "Add Shipping Rate"
- [ ] Select a state (e.g., Lagos)
- [ ] Enter rate (e.g., 2500)
- [ ] Enter delivery time (e.g., "1-2 business days")
- [ ] Click "Save"
- [ ] Rate appears in table

**Image Upload** (requires Cloudinary)
- [ ] Create/edit a product
- [ ] Click upload area
- [ ] Select image file
- [ ] Image preview appears
- [ ] Save product
- [ ] Image appears on product card

## 🚀 Production Preparation

### 9. Production Environment
- [ ] Created production `.env` file
- [ ] Using MongoDB Atlas (not local MongoDB)
- [ ] Using Cloudinary production account
- [ ] Using Paystack LIVE keys (not test keys)
- [ ] Set `NODE_ENV=production`
- [ ] Set correct `CLIENT_URL` (your domain)

### 10. Build Test
- [ ] Run `cd client && npm run build`
- [ ] Build completes without errors
- [ ] `client/dist` folder created
- [ ] Contains index.html and assets

### 11. Paystack Webhook
- [ ] Configured webhook URL in Paystack dashboard
- [ ] URL format: `https://yourdomain.com/api/webhooks/paystack`
- [ ] Webhook secret matches `PAYSTACK_SECRET_KEY`
- [ ] Tested webhook (optional - use ngrok for local testing)

## 🌐 Deployment (Whogohost)

### 12. Pre-Deployment
- [ ] Built client (`npm run build`)
- [ ] Tested production build locally
- [ ] All environment variables documented
- [ ] Database accessible from internet
- [ ] Domain configured

### 13. Whogohost Setup
- [ ] Logged into Whogohost cPanel
- [ ] Node.js app support verified
- [ ] Uploaded files via FTP/File Manager
- [ ] Installed dependencies via SSH
- [ ] Configured Node.js app in cPanel
- [ ] Set environment variables
- [ ] Started application
- [ ] Application running without errors

### 14. Post-Deployment
- [ ] Can access website via domain
- [ ] HTTPS/SSL working
- [ ] Admin dashboard loads
- [ ] Can create products
- [ ] Can upload images
- [ ] Analytics working
- [ ] Paystack webhook receiving events

## 🔒 Security

### 15. Security Checklist
- [ ] `.env` file NOT committed to Git
- [ ] `.gitignore` includes `.env`
- [ ] Using strong MongoDB password
- [ ] Paystack secret keys secure
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Webhook signature validation working

## 📊 Monitoring

### 16. Health Checks
- [ ] API health endpoint working (`/api/health`)
- [ ] MongoDB connection stable
- [ ] Cloudinary uploads working
- [ ] Paystack webhooks being received
- [ ] No errors in application logs

## ✅ Final Verification

- [ ] All features working as expected
- [ ] No console errors
- [ ] No server errors
- [ ] Images uploading correctly
- [ ] Analytics displaying correctly
- [ ] Shipping rates saving correctly
- [ ] Products CRUD working
- [ ] Performance acceptable

## 🎉 Ready to Launch!

If all items are checked, your Naira Cardigans admin dashboard is ready for production use!

## 📞 Troubleshooting

If you encounter issues, check:
1. **README.md** - Full documentation
2. **QUICKSTART.md** - Setup guide
3. **API_TESTING.md** - API testing
4. **DEPLOYMENT.md** - Deployment guide
5. Server logs for error messages
6. Browser console for frontend errors
7. MongoDB Atlas logs
8. Cloudinary dashboard
9. Paystack dashboard

## 📝 Notes

- Use test Paystack keys during development
- Switch to live keys only in production
- Keep `.env` file secure and backed up
- Document any custom configurations
- Test thoroughly before going live

