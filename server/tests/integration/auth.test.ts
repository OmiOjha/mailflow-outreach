import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes';

// mock the auth service
jest.mock('../../src/services/auth.service', () => ({
  AuthService: {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

import { AuthService } from '../../src/services/auth.service';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      (AuthService.register as jest.Mock).mockResolvedValue({
        userId: 1,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBe('test-access-token');
      expect(res.body.refreshToken).toBe('test-refresh-token');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: '123', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      (AuthService.register as jest.Mock).mockRejectedValue(
        new Error('Email already registered')
      );

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'existing@example.com', password: 'password123', name: 'Test' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      (AuthService.login as jest.Mock).mockResolvedValue({
        userId: 1,
        name: 'Test User',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe('access-token');
    });

    it('should return 401 for invalid credentials', async () => {
      (AuthService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      (AuthService.refreshToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'old-refresh-token' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe('new-access');
    });

    it('should return 400 if no refresh token provided', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
