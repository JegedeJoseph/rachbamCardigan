import express from 'express';
import { db } from './services/firebase.js';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/productRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import { protect } from './middleware/auth.js';
import checkConfig from './utils/configChecker.js';

dotenv.config();

// Check configuration before starting
if (!checkConfig()) {
  console.error('❌ Configuration check failed. Please fix the issues above.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for multiple environments
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Webhook route (before JSON parsing)
app.use('/api/webhooks', webhookRoutes);

// JSON parsing for other routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Public store routes (no auth required)
app.use('/api/store', storeRoutes);
app.use('/api/checkout', checkoutRoutes);

// Protected admin routes
app.use('/api/products', protect, productRoutes);
app.use('/api/shipping', protect, shippingRoutes);
app.use('/api/analytics', protect, analyticsRoutes);
app.use('/api/orders', protect, orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Backend is hosted separately on Render, so it only serves the API.
// Frontend is hosted on Vercel.

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;

