import express from 'express';
import ShippingRate from '../models/ShippingRate.js';
import { validate, shippingRateSchema, updateShippingRateSchema } from '../validators/productValidator.js';

const router = express.Router();

// Get all shipping rates
router.get('/', async (req, res) => {
  try {
    const rates = await ShippingRate.find().sort({ state: 1 });
    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get shipping rate by state
router.get('/:state', async (req, res) => {
  try {
    const rate = await ShippingRate.findOne({ 
      state: new RegExp(`^${req.params.state}$`, 'i') 
    });
    if (!rate) {
      return res.status(404).json({ success: false, message: 'Shipping rate not found for this state' });
    }
    res.json({ success: true, data: rate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create or update shipping rate
router.post('/', validate(shippingRateSchema), async (req, res) => {
  try {
    const { state, rate, estimatedDays } = req.body;
    
    const shippingRate = await ShippingRate.findOneAndUpdate(
      { state: new RegExp(`^${state}$`, 'i') },
      { state, rate, estimatedDays },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: shippingRate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update shipping rate
router.put('/:id', validate(updateShippingRateSchema), async (req, res) => {
  try {
    const shippingRate = await ShippingRate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!shippingRate) {
      return res.status(404).json({ success: false, message: 'Shipping rate not found' });
    }

    res.json({ success: true, data: shippingRate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete shipping rate
router.delete('/:id', async (req, res) => {
  try {
    const shippingRate = await ShippingRate.findByIdAndDelete(req.params.id);
    if (!shippingRate) {
      return res.status(404).json({ success: false, message: 'Shipping rate not found' });
    }
    res.json({ success: true, message: 'Shipping rate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

