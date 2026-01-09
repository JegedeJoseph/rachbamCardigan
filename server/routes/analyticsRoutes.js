import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Total verified orders
    const totalOrders = await Order.countDocuments({ paymentStatus: 'verified' });

    // Total revenue (only verified orders)
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'verified' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Top-selling variant
    const topVariants = await Order.aggregate([
      { $match: { paymentStatus: 'verified' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            size: '$items.size',
            color: '$items.color'
          },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Recent orders
    const recentOrders = await Order.find({ paymentStatus: 'verified' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('items.product', 'name');

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'verified',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({ totalStock: { $lt: 10, $gt: 0 } })
      .sort({ totalStock: 1 })
      .limit(10);

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

    const sales = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'verified',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: sales.length > 0 ? sales[0] : { totalSales: 0, orderCount: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

