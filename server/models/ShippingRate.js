import mongoose from 'mongoose';

const shippingRateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDays: {
    type: String,
    default: '3-5 business days'
  }
}, {
  timestamps: true
});

const ShippingRate = mongoose.model('ShippingRate', shippingRateSchema);

export default ShippingRate;

