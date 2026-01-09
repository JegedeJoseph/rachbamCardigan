import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: String,
  size: String,
  color: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  shippingAddress: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  paystackReference: {
    type: String,
    unique: true,
    sparse: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;

