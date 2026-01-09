# Quick Start Guide

Get your Naira Cardigans admin dashboard up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Setup Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# For local development, you can use these defaults:
MONGODB_URI=mongodb://localhost:27017/naira-cardigans
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Get these from your accounts:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running on your machine
mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 4. Seed Sample Data (Optional)

```bash
npm run seed
```

This will create:
- 3 sample cardigan products with variants
- 10 shipping rates for Nigerian states

### 5. Start the Application

```bash
npm run dev
```

This starts both the backend server and React frontend.

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 📱 Using the Admin Dashboard

### Adding Your First Product

1. Navigate to **Products** in the sidebar
2. Click **Add Product** button
3. Fill in the product details:
   - Name: e.g., "Premium Wool Cardigan"
   - Description: Product details
   - Price: e.g., 15000 (in Naira)
4. Add variants:
   - Size: e.g., "Large"
   - Color: e.g., "Burgundy Wool"
   - Stock: e.g., 25
   - Click **Add** to add the variant
5. Upload images:
   - Click the upload area
   - Select one or more images
   - Images will be uploaded to Cloudinary
6. Click **Create Product**

### Setting Shipping Rates

1. Navigate to **Shipping Rates** in the sidebar
2. Click **Add Shipping Rate**
3. Select a Nigerian state
4. Enter the shipping rate in Naira
5. Optionally set estimated delivery time
6. Click **Save**

### Viewing Analytics

1. Navigate to **Dashboard** in the sidebar
2. View:
   - Total verified orders
   - Total revenue in Naira
   - Top-selling variants
   - Low stock alerts

## 🔧 Common Issues

### MongoDB Connection Error

**Problem:** Can't connect to MongoDB

**Solution:**
- Ensure MongoDB is running locally, OR
- Use MongoDB Atlas and verify connection string
- Check if IP is whitelisted in Atlas (use 0.0.0.0/0 for development)

### Cloudinary Upload Fails

**Problem:** Images won't upload

**Solution:**
- Verify Cloudinary credentials in `.env`
- Check internet connection
- Ensure image file size is reasonable (< 10MB)

### Port Already in Use

**Problem:** Port 5000 or 5173 already in use

**Solution:**
```bash
# Change PORT in .env file
PORT=3000
```

Or kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

## 📚 Next Steps

1. **Configure Paystack:**
   - Get test API keys from [Paystack](https://paystack.com/)
   - Update `.env` with your keys
   - Test webhook locally using ngrok

2. **Customize the Design:**
   - Edit Tailwind colors in `client/tailwind.config.js`
   - Modify components in `client/src/components/`

3. **Add Authentication:**
   - Implement admin login
   - Add JWT tokens
   - Protect routes

4. **Deploy to Production:**
   - Follow `DEPLOYMENT.md` guide
   - Use production API keys
   - Enable HTTPS

## 🎯 Testing Checklist

- [ ] Create a product with multiple variants
- [ ] Upload product images
- [ ] Edit an existing product
- [ ] Delete a product
- [ ] Set shipping rates for different states
- [ ] View analytics dashboard
- [ ] Check low stock alerts

## 📞 Need Help?

- Check `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for production deployment
- Check the API endpoints in the README

## 🎉 You're Ready!

Your admin dashboard is now running. Start managing your cardigan inventory!

**Default URLs:**
- Admin Dashboard: http://localhost:5173/admin/dashboard
- Products: http://localhost:5173/admin/products
- Shipping: http://localhost:5173/admin/shipping

