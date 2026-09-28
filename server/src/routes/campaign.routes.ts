import { Router } from 'express';
import multer from 'multer';
import { CampaignController } from '../controllers/campaign.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// all campaign routes require auth
router.use(authenticate);

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: List all campaigns
 *     tags: [Campaigns]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of campaigns }
 */
router.get('/', CampaignController.list);

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', CampaignController.create);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get campaign details with steps and leads
 *     tags: [Campaigns]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', CampaignController.getById);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   put:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', CampaignController.update);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', CampaignController.delete);

// Steps
router.post('/:id/steps', CampaignController.addStep);
router.put('/:id/steps/:stepId', CampaignController.updateStep);
router.delete('/:id/steps/:stepId', CampaignController.deleteStep);

// Leads
router.get('/:id/leads', CampaignController.getLeads);
router.post('/:id/leads/import', upload.single('file'), CampaignController.importLeads);

// Launch
router.post('/:id/launch', CampaignController.launch);

// Analytics
router.get('/:id/analytics', CampaignController.analytics);

export default router;
