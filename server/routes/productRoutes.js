import express from 'express';
import { productRepository } from '../repositories/productRepository.js';
import { uploadImage, uploadMultipleImages, deleteImage } from '../services/cloudinary.js';
import { validate, createProductSchema, updateProductSchema } from '../validators/productValidator.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await productRepository.find();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
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

// Create product
router.post('/', validate(createProductSchema), async (req, res) => {
  try {
    const product = await productRepository.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product
router.put('/:id', validate(updateProductSchema), async (req, res) => {
  try {
    const product = await productRepository.findByIdAndUpdate(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await productRepository.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete images from Cloudinary
    if (product.images) {
      for (const image of product.images) {
        if (image.publicId) await deleteImage(image.publicId);
      }
    }

    await productRepository.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload product images
router.post('/:id/images', async (req, res) => {
  try {
    const { images } = req.body; 
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    const uploadedImages = await uploadMultipleImages(images);
    
    const product = await productRepository.addImages(req.params.id, uploadedImages);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product image
router.delete('/:id/images/:imageId', async (req, res) => {
  try {
    const product = await productRepository.removeImage(req.params.id, req.params.imageId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product or Image not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

