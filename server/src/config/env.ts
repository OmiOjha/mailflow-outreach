import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'mailflow',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  tracking: {
    baseUrl: process.env.TRACKING_BASE_URL || 'http://localhost:3001',
  },

  rateLimits: {
    emailsPerMailboxPerHour: parseInt(process.env.EMAILS_PER_MAILBOX_PER_HOUR || '50', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default env;
