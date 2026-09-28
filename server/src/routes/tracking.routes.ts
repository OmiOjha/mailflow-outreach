import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller';

const router = Router();

// these are public endpoints — no auth needed (email clients hit them)
router.get('/open/:trackingId', TrackingController.trackOpen);
router.get('/click/:trackingId', TrackingController.trackClick);

export default router;
