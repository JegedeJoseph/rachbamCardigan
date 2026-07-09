import express from 'express';
import { productRepository } from '../repositories/productRepository.js';

const router = express.Router();

// @route   GET /api/store/products
// @desc    Get all products (public - for storefront)
// @access  Public
router.get('/products', async (req, res) => {
  try {
    const products = await productRepository.find();
    // Sort in memory by featured and then createdAt
    products.sort((a, b) => {
      if (a.featured === b.featured) {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      return a.featured ? -1 : 1;
    });
    
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
    const products = await productRepository.findFeatured();
    
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
    const product = await productRepository.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
