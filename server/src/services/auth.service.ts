import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import env from '../config/env';
import { AuthPayload } from '../types';

export const AuthService = {
  async register(email: string, password: string, name: string) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hash = await bcrypt.hash(password, 10);
    const userId = await UserModel.create(email, hash, name);

    const tokens = generateTokens({ userId, email });
    return { userId, ...tokens };
  },

  async login(email: string, password: string) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const tokens = generateTokens({ userId: user.id, email: user.email });
    return { userId: user.id, name: user.name, ...tokens };
  },

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.jwt.refreshSecret) as AuthPayload;
      const tokens = generateTokens({ userId: decoded.userId, email: decoded.email });
      return tokens;
    } catch {
      throw new Error('Invalid refresh token');
    }
  },
};

function generateTokens(payload: AuthPayload) {
  const accessToken = jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
  const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
}
