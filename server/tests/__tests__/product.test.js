import request from 'supertest';
import mongoose from 'mongoose';
import { createTestApp } from '../testApp.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';

const app = createTestApp();

describe('Product API', () => {
  let authToken;
  let adminUser;

  // Create admin user and get auth token before running tests
  beforeEach(async () => {
    adminUser = await User.create({
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
  });

  describe('GET /api/products', () => {
    it('should return empty array when no products exist', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return all products', async () => {
      // Create test products
      await Product.create([
        {
          name: 'Test Cardigan 1',
          description: 'A beautiful cardigan',
          price: 15000,
          variants: [{ size: 'M', color: 'Blue', stock: 10 }]
        },
        {
          name: 'Test Cardigan 2',
          description: 'Another beautiful cardigan',
          price: 18000,
          variants: [{ size: 'L', color: 'Red', stock: 5 }]
        }
      ]);

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      const product = await Product.create({
        name: 'Test Cardigan',
        description: 'A beautiful cardigan',
        price: 15000,
        variants: [{ size: 'M', color: 'Blue', stock: 10 }]
      });

      const res = await request(app)
        .get(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Cardigan');
      expect(res.body.data.price).toBe(15000);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Cardigan',
        description: 'A brand new cardigan',
        price: 20000,
        variants: [
          { size: 'S', color: 'White', stock: 15 },
          { size: 'M', color: 'White', stock: 20 }
        ],
        category: 'Cardigan',
        featured: true
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Cardigan');
      expect(res.body.data.price).toBe(20000);
      expect(res.body.data.variants).toHaveLength(2);
      expect(res.body.data.totalStock).toBe(35);
    });

    it('should fail validation for missing required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Product'
          // Missing description and price
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Test',
          description: 'Test',
          price: 10000
        });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      const product = await Product.create({
        name: 'Original Cardigan',
        description: 'Original description',
        price: 15000,
        variants: [{ size: 'M', color: 'Blue', stock: 10 }]
      });

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Cardigan',
          price: 18000
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Cardigan');
      expect(res.body.data.price).toBe(18000);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const product = await Product.create({
        name: 'To Delete',
        description: 'Will be deleted',
        price: 10000,
        variants: [],
        images: []
      });

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify product is deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
