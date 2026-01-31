import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ShippingRate from '../models/ShippingRate.js';

const router = express.Router();

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `NC-${timestamp}-${random}`;
};

// Validate cart items and calculate totals
const validateCart = async (items) => {
  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const variant = product.variants.id(item.variantId);
    if (!variant) {
      throw new Error(`Variant not found for ${product.name}`);
    }

    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name} (${variant.size}/${variant.color}). Available: ${variant.stock}`);
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    validatedItems.push({
      product: product._id,
      variantId: variant._id,
      name: product.name,
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      price: product.price
    });
  }

  return { validatedItems, subtotal };
};

// @route   POST /api/checkout/create-order
// @desc    Create order and initialize Paystack payment
// @access  Public
router.post('/create-order', async (req, res) => {
  try {
    const { items, customer, shippingAddress } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ success: false, message: 'Customer information is required' });
    }

    if (!shippingAddress?.state) {
      return res.status(400).json({ success: false, message: 'Shipping state is required' });
    }

    // Validate cart items
    const { validatedItems, subtotal } = await validateCart(items);

    // Get shipping rate
    const shippingRate = await ShippingRate.findOne({ state: shippingAddress.state });
    if (!shippingRate) {
      return res.status(400).json({ success: false, message: `Shipping not available to ${shippingAddress.state}` });
    }

    const shippingCost = shippingRate.rate;
    const total = subtotal + shippingCost;

    // Generate order number and reference
    const orderNumber = generateOrderNumber();
    const paystackReference = `${orderNumber}-${Date.now()}`;

    // Create order (pending payment)
    const order = new Order({
      orderNumber,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode || ''
      },
      items: validatedItems,
      subtotal,
      shippingCost,
      total,
      paystackReference,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    await order.save();

    // Initialize Paystack transaction
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: customer.email,
        amount: Math.round(total * 100), // Paystack expects amount in kobo
        reference: paystackReference,
        callback_url: `${process.env.CLIENT_URL}/order-confirmation?reference=${paystackReference}`,
        metadata: {
          order_number: orderNumber,
          customer_name: customer.name,
          customer_phone: customer.phone
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!paystackResponse.data.status) {
      throw new Error('Failed to initialize payment');
    }

    res.json({
      success: true,
      data: {
        orderNumber,
        reference: paystackReference,
        authorizationUrl: paystackResponse.data.data.authorization_url,
        accessCode: paystackResponse.data.data.access_code
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create order' 
    });
  }
});

// @route   GET /api/checkout/verify/:reference
// @desc    Verify payment status
// @access  Public
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    // Find order
    const order = await Order.findOne({ paystackReference: reference })
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If already verified, return order
    if (order.paymentStatus === 'verified') {
      return res.json({
        success: true,
        data: {
          order,
          paymentVerified: true
        }
      });
    }

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (paystackResponse.data.data.status === 'success') {
      // Update order status
      order.paymentStatus = 'verified';
      order.orderStatus = 'processing';
      await order.save();

      // Deduct stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const variant = product.variants.id(item.variantId);
          if (variant) {
            variant.stock -= item.quantity;
            await product.save();
          }
        }
      }

      return res.json({
        success: true,
        data: {
          order,
          paymentVerified: true
        }
      });
    }

    res.json({
      success: true,
      data: {
        order,
        paymentVerified: false,
        paymentStatus: paystackResponse.data.data.status
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to verify payment' 
    });
  }
});

// @route   GET /api/checkout/shipping-rates
// @desc    Get all shipping rates
// @access  Public
router.get('/shipping-rates', async (req, res) => {
  try {
    const rates = await ShippingRate.find().sort({ state: 1 });
    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/checkout/track/:orderNumber
// @desc    Track order by order number
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        items: order.items,
        total: order.total,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
