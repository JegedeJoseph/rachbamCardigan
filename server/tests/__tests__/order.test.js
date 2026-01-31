import request from 'supertest';
import mongoose from 'mongoose';
import { createTestApp } from '../testApp.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';

const app = createTestApp();

describe('Order API', () => {
  let authToken;
  let testProduct;
  let testOrder;

  beforeEach(async () => {
    // Create admin user
    await User.create({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'superadmin'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    authToken = loginRes.body.data.token;

    // Create test product
    testProduct = await Product.create({
      name: 'Test Cardigan',
      description: 'A test cardigan',
      price: 15000,
      variants: [{ size: 'M', color: 'Blue', stock: 10 }]
    });

    // Create test order
    testOrder = await Order.create({
      orderNumber: 'ORD-TEST-001',
      customer: {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '08012345678'
      },
      shippingAddress: {
        address: '123 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        zipCode: '100001'
      },
      items: [{
        product: testProduct._id,
        variantId: testProduct.variants[0]._id,
        name: 'Test Cardigan',
        size: 'M',
        color: 'Blue',
        quantity: 2,
        price: 15000
      }],
      subtotal: 30000,
      shippingCost: 2000,
      total: 32000,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });
  });

  describe('GET /api/orders', () => {
    it('should return paginated orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by paymentStatus', async () => {
      // Create verified order
      await Order.create({
        orderNumber: 'ORD-TEST-002',
        customer: { name: 'Jane', email: 'jane@test.com', phone: '08087654321' },
        shippingAddress: { address: '456 Test Ave', city: 'Abuja', state: 'FCT' },
        items: [{
          product: testProduct._id,
          variantId: testProduct.variants[0]._id,
          name: 'Test Cardigan',
          size: 'M',
          color: 'Blue',
          quantity: 1,
          price: 15000
        }],
        subtotal: 15000,
        shippingCost: 2500,
        total: 17500,
        paymentStatus: 'verified',
        orderStatus: 'processing'
      });

      const res = await request(app)
        .get('/api/orders?paymentStatus=verified')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].paymentStatus).toBe('verified');
    });

    it('should filter by orderStatus', async () => {
      const res = await request(app)
        .get('/api/orders?orderStatus=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should search by order number', async () => {
      const res = await request(app)
        .get('/api/orders?search=ORD-TEST-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].orderNumber).toBe('ORD-TEST-001');
    });

    it('should search by customer name', async () => {
      const res = await request(app)
        .get('/api/orders?search=John')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/orders');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return single order by ID', async () => {
      const res = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toBe('ORD-TEST-001');
      expect(res.body.data.customer.name).toBe('John Doe');
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/orders/number/:orderNumber', () => {
    it('should return order by order number', async () => {
      const res = await request(app)
        .get('/api/orders/number/ORD-TEST-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toBe('ORD-TEST-001');
    });

    it('should return 404 for non-existent order number', async () => {
      const res = await request(app)
        .get('/api/orders/number/ORD-NONEXISTENT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderStatus: 'processing' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderStatus).toBe('processing');
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderStatus: 'invalid-status' });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/orders/${fakeId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderStatus: 'processing' });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/orders/:id/payment', () => {
    it('should update payment status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${testOrder._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ paymentStatus: 'verified' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('verified');
    });

    it('should reject invalid payment status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${testOrder._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ paymentStatus: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders/stats/summary', () => {
    it('should return order statistics', async () => {
      // Create additional orders with different statuses
      await Order.create({
        orderNumber: 'ORD-TEST-002',
        customer: { name: 'Jane', email: 'jane@test.com', phone: '08087654321' },
        shippingAddress: { address: '456 Test Ave', city: 'Abuja', state: 'FCT' },
        items: [{
          product: testProduct._id,
          variantId: testProduct.variants[0]._id,
          name: 'Test Cardigan',
          size: 'M',
          color: 'Blue',
          quantity: 1,
          price: 15000
        }],
        subtotal: 15000,
        shippingCost: 2500,
        total: 17500,
        paymentStatus: 'verified',
        orderStatus: 'delivered'
      });

      const res = await request(app)
        .get('/api/orders/stats/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
