import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User';
import { createTestUser } from '../../test/setup';

describe('Auth Controller', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          phone: '+963987654321',
          email: 'john@example.com',
          password: 'password123',
          role: 'customer'
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('name', 'John Doe');
      expect(response.body).toHaveProperty('token');

      const user = await User.findOne({ phone: '+963987654321' });
      expect(user).toBeTruthy();
      expect(user?.role).toBe('customer');
    });

    it('should not register a user with existing phone number', async () => {
      await createTestUser();

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Another User',
          phone: '+963123456789', // Same phone as createTestUser
          email: 'another@example.com',
          password: 'password123',
          role: 'customer'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const { user } = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: user.phone,
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('phone', user.phone);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
      const { user } = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: user.phone,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const { user, token } = await createTestUser();

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', user.name);
      expect(response.body).toHaveProperty('phone', user.phone);
    });

    it('should not return profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Please authenticate.');
    });
  });
}); 