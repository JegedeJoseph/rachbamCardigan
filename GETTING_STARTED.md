# Getting Started with Naira Cardigans Admin Dashboard

Welcome! This guide will help you get your e-commerce admin dashboard up and running.

## 📚 Documentation Overview

We've created comprehensive documentation to help you:

1. **GETTING_STARTED.md** (this file) - Start here!
2. **QUICKSTART.md** - 5-minute setup guide
3. **README.md** - Complete project documentation
4. **SETUP_CHECKLIST.md** - Step-by-step checklist
5. **API_TESTING.md** - API endpoint testing
6. **DEPLOYMENT.md** - Whogohost deployment guide
7. **PROJECT_SUMMARY.md** - Feature overview

## 🎯 What You're Building

A complete admin dashboard for managing:
- **Products** with dynamic variants (size, color, stock)
- **Images** via Cloudinary cloud storage
- **Shipping rates** for all Nigerian states
- **Sales analytics** with revenue tracking
- **Payment verification** via Paystack webhooks

## 🚦 Choose Your Path

### Path 1: Quick Demo (5 minutes)
**Goal:** See the dashboard running with sample data

1. Follow **QUICKSTART.md**
2. Use local MongoDB or quick Atlas setup
3. Use placeholder Cloudinary/Paystack credentials (limited functionality)
4. Run `npm run seed` for sample data
5. Start with `npm run dev`

**Best for:** Quick evaluation, learning the interface

### Path 2: Full Setup (30 minutes)
**Goal:** Production-ready setup with all features working

1. Follow **SETUP_CHECKLIST.md** completely
2. Set up MongoDB Atlas
3. Configure Cloudinary account
4. Configure Paystack account
5. Test all features thoroughly

**Best for:** Development, testing, production deployment

### Path 3: Production Deployment (1-2 hours)
**Goal:** Deploy to Whogohost hosting

1. Complete Path 2 first
2. Follow **DEPLOYMENT.md** guide
3. Configure production environment
4. Set up SSL/HTTPS
5. Configure Paystack webhooks

**Best for:** Going live with real customers

## 🛠️ Prerequisites

Before starting, ensure you have:

- [ ] **Node.js 18+** - [Download here](https://nodejs.org/)
- [ ] **npm** (comes with Node.js)
- [ ] **Code editor** (VS Code recommended)
- [ ] **Terminal/Command Prompt** access

Optional but recommended:
- [ ] **Git** for version control
- [ ] **MongoDB Compass** for database viewing
- [ ] **Postman** for API testing

## 📦 What's Included

### Backend (server/)
```
✅ Express.js REST API
✅ MongoDB models with Mongoose
✅ Zod validation schemas
✅ Cloudinary image service
✅ Paystack webhook handler
✅ Analytics endpoints
✅ Sample data seeder
```

### Frontend (client/)
```
✅ React 18 with Vite
✅ Tailwind CSS styling
✅ Admin dashboard layout
✅ Product management UI
✅ Shipping rates manager
✅ Analytics dashboard
✅ Image upload interface
```

### Documentation
```
✅ 7 comprehensive guides
✅ API testing examples
✅ Deployment instructions
✅ Setup checklist
✅ Architecture diagrams
```

## 🎓 Learning Path

### For Beginners
1. Start with **QUICKSTART.md**
2. Explore the running application
3. Read **PROJECT_SUMMARY.md** to understand features
4. Review code in `client/src/pages/` for UI
5. Review code in `server/routes/` for API

### For Developers
1. Review **PROJECT_SUMMARY.md** for architecture
2. Check **API_TESTING.md** for endpoints
3. Examine `server/models/` for data structure
4. Study `server/validators/` for Zod schemas
5. Review `client/src/components/` for React patterns

### For DevOps/Deployment
1. Complete **SETUP_CHECKLIST.md**
2. Study **DEPLOYMENT.md** thoroughly
3. Test locally with production build
4. Follow Whogohost deployment steps
5. Configure monitoring and backups

## 🔑 Required Accounts

You'll need accounts for these services:

### 1. MongoDB Atlas (Database)
- **URL:** https://www.mongodb.com/cloud/atlas
- **Cost:** Free tier available (512MB)
- **Setup time:** 5 minutes
- **What you need:** Connection string

### 2. Cloudinary (Image Storage)
- **URL:** https://cloudinary.com/
- **Cost:** Free tier available (25GB storage)
- **Setup time:** 3 minutes
- **What you need:** Cloud name, API key, API secret

### 3. Paystack (Payments)
- **URL:** https://paystack.com/
- **Cost:** Free (transaction fees apply)
- **Setup time:** 10 minutes (+ verification time)
- **What you need:** Secret key, Public key

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Add sample data (optional)
npm run seed

# 4. Start development server
npm run dev

# 5. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

## 🎨 First Steps After Installation

1. **View Dashboard**
   - Navigate to http://localhost:5173/admin/dashboard
   - See analytics overview

2. **Create Your First Product**
   - Go to Products → Add Product
   - Fill in details
   - Add variants (e.g., Large, Burgundy, 25 stock)
   - Upload image (requires Cloudinary)
   - Save

3. **Set Shipping Rates**
   - Go to Shipping Rates
   - Add rate for Lagos (e.g., ₦2,500)
   - Add more states as needed

4. **Explore Analytics**
   - Return to Dashboard
   - View sales metrics
   - Check top-selling variants

## 🐛 Common Issues

### "Cannot connect to MongoDB"
→ Check MongoDB is running or Atlas connection string is correct

### "Cloudinary upload failed"
→ Verify credentials in .env file

### "Port already in use"
→ Change PORT in .env or kill process using the port

### "Module not found"
→ Run `npm install` in both root and client directories

## 📞 Getting Help

1. **Check documentation** - Most answers are in the guides
2. **Review error messages** - They usually indicate the problem
3. **Check console logs** - Both browser and server
4. **Verify .env file** - Ensure all credentials are correct
5. **Test API directly** - Use API_TESTING.md examples

## ✅ Success Checklist

You'll know everything is working when:

- [ ] Dashboard loads without errors
- [ ] Can create a product with variants
- [ ] Can upload images (with Cloudinary configured)
- [ ] Can set shipping rates
- [ ] Analytics display correctly
- [ ] No console errors in browser
- [ ] No errors in server terminal

## 🎯 Next Steps

Once everything is running:

1. **Customize** - Update colors in `client/tailwind.config.js`
2. **Add data** - Create your actual products
3. **Test thoroughly** - Try all features
4. **Deploy** - Follow DEPLOYMENT.md when ready
5. **Monitor** - Check analytics regularly

## 📖 Recommended Reading Order

1. **GETTING_STARTED.md** ← You are here
2. **QUICKSTART.md** ← Next: Get it running
3. **SETUP_CHECKLIST.md** ← Then: Complete setup
4. **PROJECT_SUMMARY.md** ← Understand features
5. **API_TESTING.md** ← Test the API
6. **DEPLOYMENT.md** ← When ready to deploy

## 🎉 Ready to Begin?

Choose your path above and start with the appropriate guide!

**Quick Demo?** → Go to **QUICKSTART.md**
**Full Setup?** → Go to **SETUP_CHECKLIST.md**
**Deploy?** → Go to **DEPLOYMENT.md**

Good luck! 🚀

