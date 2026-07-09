import express from 'express';
import crypto from 'crypto';
import { orderRepository } from '../repositories/orderRepository.js';
import { productRepository } from '../repositories/productRepository.js';

const router = express.Router();

// Paystack webhook handler
router.post('/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;

    // Handle successful payment
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;

      // Find and update order
      const order = await orderRepository.findOneByPaystackReference(reference);

      if (!order) {
        console.error('Order not found for reference:', reference);
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Verify amount matches
      if (order.total * 100 !== amount) {
        console.error('Amount mismatch:', { expected: order.total * 100, received: amount });
        return res.status(400).json({ success: false, message: 'Amount mismatch' });
      }

      // Update order status
      await orderRepository.findByIdAndUpdate(order._id, {
        paymentStatus: 'verified',
        orderStatus: 'processing'
      });

      // Update product stock
      for (const item of order.items) {
        const product = await productRepository.findById(item.product._id || item.product);
        if (product) {
          const variantIndex = product.variants.findIndex(v => v._id === item.variantId || v.id === item.variantId);
          if (variantIndex !== -1) {
            product.variants[variantIndex].stock -= item.quantity;
            await productRepository.findByIdAndUpdate(product._id, { variants: product.variants });
          }
        }
      }

      console.log('Payment verified for order:', order.orderNumber);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

