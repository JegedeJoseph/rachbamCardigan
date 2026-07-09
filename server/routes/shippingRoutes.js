import express from 'express';
import { shippingRateRepository } from '../repositories/shippingRateRepository.js';
import { validate, shippingRateSchema, updateShippingRateSchema } from '../validators/productValidator.js';

const router = express.Router();

// Get all shipping rates
router.get('/', async (req, res) => {
  try {
    const rates = await shippingRateRepository.find();
    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get shipping rate by state
router.get('/:state', async (req, res) => {
  try {
    const rate = await shippingRateRepository.findOneByState(req.params.state);
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
    
    const shippingRate = await shippingRateRepository.findOneAndUpdateByState(
      state,
      { rate, estimatedDays }
    );

    res.status(201).json({ success: true, data: shippingRate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update shipping rate
router.put('/:id', validate(updateShippingRateSchema), async (req, res) => {
  try {
    const shippingRate = await shippingRateRepository.findByIdAndUpdate(req.params.id, req.body);
    
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
    const shippingRate = await shippingRateRepository.findByIdAndDelete(req.params.id);
    if (!shippingRate) {
      return res.status(404).json({ success: false, message: 'Shipping rate not found' });
    }
    res.json({ success: true, message: 'Shipping rate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

