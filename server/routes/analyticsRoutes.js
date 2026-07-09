import express from 'express';
import { orderRepository } from '../repositories/orderRepository.js';
import { productRepository } from '../repositories/productRepository.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const {
      totalOrders,
      totalRevenue,
      topVariants,
      recentOrders,
      monthlyRevenue
    } = await orderRepository.getAnalyticsDashboard();

    // Low stock products
    const lowStockProducts = await productRepository.findLowStock();

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        topVariants,
        recentOrders,
        monthlyRevenue,
        lowStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sales by period
router.get('/sales', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const sales = await orderRepository.getSalesByPeriod(startDate);

    res.json({
      success: true,
      data: sales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

