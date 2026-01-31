import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// @route   GET /api/store/products
// @desc    Get all products (public - for storefront)
// @access  Public
router.get('/products', async (req, res) => {
  try {
    // Only return products with stock
    const products = await Product.find()
      .sort({ featured: -1, createdAt: -1 });
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/store/products/featured
// @desc    Get featured products
// @access  Public
router.get('/products/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true, totalStock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(8);
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/store/products/:id
// @desc    Get single product (public)
// @access  Public
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
