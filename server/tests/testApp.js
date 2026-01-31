import express from 'express';
import cors from 'cors';
import productRoutes from '../routes/productRoutes.js';
import shippingRoutes from '../routes/shippingRoutes.js';
import orderRoutes from '../routes/orderRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import storeRoutes from '../routes/storeRoutes.js';
import checkoutRoutes from '../routes/checkoutRoutes.js';
import { protect } from '../middleware/auth.js';

// Create a fresh Express app for testing
export function createTestApp() {
  const app = express();

  // Middleware
  app.use(cors());
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
  app.use('/api/orders', protect, orderRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  });

  return app;
}

export default createTestApp;
