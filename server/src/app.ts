import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import env from './config/env';
import { testConnection } from './config/database';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import campaignRoutes from './routes/campaign.routes';
import mailboxRoutes from './routes/mailbox.routes';
import trackingRoutes from './routes/tracking.routes';

const app = express();

// ---- Middleware ----
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/track'), // don't rate limit tracking pixels
});
app.use('/api/', limiter);

// ---- Swagger ----
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/mailboxes', mailboxRoutes);
app.use('/api/track', trackingRoutes);

// health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Error Handling ----
app.use(notFound);
app.use(errorHandler);

// ---- Start ----
async function start() {
  try {
    try {
      await testConnection();
    } catch (err: any) {
      console.warn('⚠️  MySQL not reachable yet (start MySQL or Docker to enable persistence):', err.message);
    }

    app.listen(env.port, () => {
      console.log(`\n🚀 MailFlow API running on http://localhost:${env.port}`);
      console.log(`📖 Swagger docs at http://localhost:${env.port}/api/docs\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export default app;
