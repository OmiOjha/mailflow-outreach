import request from 'supertest';
import express from 'express';
import campaignRoutes from '../../src/routes/campaign.routes';
import { CampaignModel } from '../../src/models/campaign.model';
import { StepModel } from '../../src/models/step.model';
import { LeadModel } from '../../src/models/lead.model';
import { EmailLogModel } from '../../src/models/emailLog.model';
import { CampaignService } from '../../src/services/campaign.service';

// Mock dependencies
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 1, email: 'test@mailflow.io' };
    next();
  },
}));

jest.mock('../../src/models/campaign.model');
jest.mock('../../src/models/step.model');
jest.mock('../../src/models/lead.model');
jest.mock('../../src/models/emailLog.model');
jest.mock('../../src/services/campaign.service');

const app = express();
app.use(express.json());
app.use('/api/campaigns', campaignRoutes);

describe('Campaign & Outreach API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/campaigns', () => {
    it('should list all campaigns belonging to the authenticated user', async () => {
      const mockCampaigns = [
        {
          id: 10,
          user_id: 1,
          name: 'SaaS Founders Outreach',
          description: 'Q1 cold outreach campaign',
          status: 'active',
          lead_count: 140,
          step_count: 3,
        },
      ];
      (CampaignModel.findAllByUser as jest.Mock).mockResolvedValue(mockCampaigns);

      const res = await request(app).get('/api/campaigns');
      expect(res.status).toBe(200);
      expect(res.body.campaigns).toHaveLength(1);
      expect(res.body.campaigns[0].name).toBe('SaaS Founders Outreach');
    });
  });

  describe('POST /api/campaigns', () => {
    it('should create a new campaign', async () => {
      (CampaignModel.create as jest.Mock).mockResolvedValue(12);
      (CampaignModel.findById as jest.Mock).mockResolvedValue({
        id: 12,
        user_id: 1,
        name: 'New Product Pitch',
        status: 'draft',
      });

      const res = await request(app)
        .post('/api/campaigns')
        .send({ name: 'New Product Pitch' });

      expect(res.status).toBe(201);
      expect(res.body.campaign).toHaveProperty('id', 12);
    });

    it('should reject creation without campaign name', async () => {
      const res = await request(app).post('/api/campaigns').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/campaigns/:id/steps', () => {
    it('should append a sequence step', async () => {
      (CampaignModel.findById as jest.Mock).mockResolvedValue({ id: 10, user_id: 1 });
      (StepModel.create as jest.Mock).mockResolvedValue(101);
      (StepModel.findById as jest.Mock).mockResolvedValue({
        id: 101,
        campaign_id: 10,
        step_order: 1,
        subject: 'Quick question for {{firstName}}',
        body: 'Saw what you are building at {{company}}.',
        delay_days: 2,
      });

      const res = await request(app)
        .post('/api/campaigns/10/steps')
        .send({
          subject: 'Quick question for {{firstName}}',
          body: 'Saw what you are building at {{company}}.',
          delayDays: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.step.subject).toContain('{{firstName}}');
    });
  });

  describe('POST /api/campaigns/:id/launch', () => {
    it('should trigger campaign queueing', async () => {
      (CampaignService.launch as jest.Mock).mockResolvedValue({ queued: 45 });

      const res = await request(app).post('/api/campaigns/10/launch');
      expect(res.status).toBe(200);
      expect(res.body.queued).toBe(45);
    });
  });

  describe('GET /api/campaigns/:id/analytics', () => {
    it('should return campaign open rate and funnel analytics', async () => {
      (CampaignModel.findById as jest.Mock).mockResolvedValue({ id: 10, user_id: 1 });
      (EmailLogModel.getAnalytics as jest.Mock).mockResolvedValue({
        totalLeads: 100,
        emailsSent: 80,
        emailsOpened: 48,
        emailsClicked: 16,
        emailsBounced: 2,
        openRate: 60,
        clickRate: 20,
        bounceRate: 2,
        stepBreakdown: [],
      });

      const res = await request(app).get('/api/campaigns/10/analytics');
      expect(res.status).toBe(200);
      expect(res.body.analytics.openRate).toBe(60);
      expect(res.body.analytics.emailsOpened).toBe(48);
    });
  });
});
