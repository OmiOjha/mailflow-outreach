import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const result = await AuthService.register(data.email, data.password, data.name);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: err.errors });
        return;
      }
      if (err.message === 'Email already registered') {
        res.status(409).json({ error: err.message });
        return;
      }
      console.error('Register error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data.email, data.password);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Invalid credentials') {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }
      const tokens = await AuthService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (err: any) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  },
};
