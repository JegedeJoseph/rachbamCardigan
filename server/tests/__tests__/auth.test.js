import request from 'supertest';
import { createTestApp } from '../testApp.js';
import User from '../../models/User.js';

const app = createTestApp();

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register first user as superadmin', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('superadmin');
      expect(res.body.data.user.email).toBe('admin@test.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should not allow second user without auth', async () => {
      // Create first user
      await User.create({
        name: 'First Admin',
        email: 'first@test.com',
        password: 'password123',
        role: 'superadmin'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'second@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow superadmin to create new user', async () => {
      // Create and login first user
      await User.create({
        name: 'Super Admin',
        email: 'super@test.com',
        password: 'password123',
        role: 'superadmin'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'super@test.com',
          password: 'password123'
        });

      const token = loginRes.body.data.token;

      // Create second user with auth
      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Admin',
          email: 'newadmin@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('admin'); // Not superadmin
    });

    it('should reject duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@test.com',
        password: 'password123',
        role: 'superadmin'
      });

      // Try to register with same email (as first user scenario, so no auth needed)
      await User.deleteMany({});
      await User.create({
        name: 'Existing User',
        email: 'existing@test.com',
        password: 'password123',
        role: 'superadmin'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'existing@test.com',
          password: 'password123'
        });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Duplicate User',
          email: 'existing@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'admin'
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('test@test.com');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await User.create({
        name: 'Me User',
        email: 'me@test.com',
        password: 'password123',
        role: 'admin'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@test.com',
          password: 'password123'
        });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('me@test.com');
      expect(res.body.data.name).toBe('Me User');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/password', () => {
    let authToken;

    beforeEach(async () => {
      await User.create({
        name: 'Password User',
        email: 'password@test.com',
        password: 'oldpassword123',
        role: 'admin'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'password@test.com',
          password: 'oldpassword123'
        });

      authToken = loginRes.body.data.token;
    });

    it('should change password with valid current password', async () => {
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'password@test.com',
          password: 'newpassword123'
        });

      expect(loginRes.status).toBe(200);
    });

    it('should reject wrong current password', async () => {
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/check', () => {
    it('should return requiresSetup true when no users exist', async () => {
      const res = await request(app).get('/api/auth/check');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requiresSetup).toBe(true);
    });

    it('should return requiresSetup false when users exist', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@test.com',
        password: 'password123',
        role: 'superadmin'
      });

      const res = await request(app).get('/api/auth/check');

      expect(res.status).toBe(200);
      expect(res.body.data.requiresSetup).toBe(false);
    });
  });
});
