# Naira Cardigans - E-commerce Admin Dashboard

A production-ready MERN stack e-commerce platform for managing cardigan products with integrated payment processing via Paystack.

## 🚀 Features

### Product Management
- ✅ Create, edit, and delete products
- ✅ Dynamic variant management (size, color, stock)
- ✅ Cloudinary image upload integration
- ✅ Real-time stock tracking
- ✅ Zod validation for data integrity

### Shipping Management
- ✅ Configure shipping rates per Nigerian state
- ✅ Estimated delivery times
- ✅ Easy rate updates

### Sales Analytics Dashboard
- ✅ Total verified orders (via Paystack webhook)
- ✅ Total revenue in Naira (₦)
- ✅ Top-selling variants by size and color
- ✅ Low stock alerts
- ✅ Monthly revenue trends

### Payment Integration
- ✅ Paystack webhook for payment verification
- ✅ Automatic stock deduction on verified payments
- ✅ Secure signature validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Paystack account

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd rachbamCardigan
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/naira-cardigans

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 4. Run the application

```bash
# Development mode (runs both server and client)
npm run dev

# Server only
npm run server

# Client only
npm run client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
rachbamCardigan/
├── server/
│   ├── models/           # MongoDB models
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── ShippingRate.js
│   ├── routes/           # API routes
│   │   ├── productRoutes.js
│   │   ├── shippingRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── webhookRoutes.js
│   ├── services/         # External services
│   │   └── cloudinary.js
│   ├── validators/       # Zod schemas
│   │   └── productValidator.js
│   └── index.js          # Server entry point
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── package.json
└── package.json
```

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/images` - Upload images
- `DELETE /api/products/:id/images/:imageId` - Delete image

### Shipping
- `GET /api/shipping` - Get all shipping rates
- `GET /api/shipping/:state` - Get rate by state
- `POST /api/shipping` - Create/update shipping rate
- `PUT /api/shipping/:id` - Update shipping rate
- `DELETE /api/shipping/:id` - Delete shipping rate

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/sales?period=week` - Get sales by period

### Webhooks
- `POST /api/webhooks/paystack` - Paystack payment webhook

## 🎨 Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (icons)

**Backend:**
- Node.js
- Express
- MongoDB with Mongoose
- Zod (validation)
- Cloudinary (image storage)
- Paystack (payments)

## 📦 Deployment to Whogohost

### Backend Deployment

1. **Build the client:**
```bash
cd client
npm run build
cd ..
```

2. **Configure for production:**
Update `.env` with production values

3. **Upload to Whogohost:**
- Use cPanel File Manager or FTP
- Upload all files except `node_modules` and `client/node_modules`
- Install dependencies via SSH or cPanel Terminal:
```bash
npm install --production
cd client && npm install && npm run build
```

4. **Configure Node.js App in cPanel:**
- Application Root: `/home/username/rachbamCardigan`
- Application URL: your domain
- Application Startup File: `server/index.js`
- Node.js Version: 18.x or higher

5. **Set Environment Variables in cPanel**

### MongoDB Setup
- Use MongoDB Atlas (recommended)
- Or install MongoDB on VPS if available

### Paystack Webhook Configuration
- Go to Paystack Dashboard → Settings → Webhooks
- Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
- Copy the secret key to your `.env`

## 🔐 Security Notes

- Never commit `.env` file
- Use strong MongoDB passwords
- Keep Paystack secret keys secure
- Validate webhook signatures
- Use HTTPS in production

## 📝 License

MIT

## 👨‍💻 Support

For issues and questions, please open an issue in the repository.

