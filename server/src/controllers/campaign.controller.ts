import { Response } from 'express';
import { CampaignModel } from '../models/campaign.model';
import { StepModel } from '../models/step.model';
import { LeadModel } from '../models/lead.model';
import { EmailLogModel } from '../models/emailLog.model';
import { CampaignService } from '../services/campaign.service';
import { parseCsv } from '../utils/csvParser';
import { AuthRequest } from '../types';

export const CampaignController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const campaigns = await CampaignModel.findAllByUser(req.user!.userId);
      res.json({ campaigns });
    } catch (err) {
      console.error('List campaigns error:', err);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const campaign = await CampaignModel.findById(id, req.user!.userId);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      // fetch steps & lead count alongside
      const steps = await StepModel.findByCampaign(id);
      const { leads, total } = await LeadModel.findByCampaign(id, 1, 10);

      res.json({ campaign, steps, leads: { data: leads, total } });
    } catch (err) {
      console.error('Get campaign error:', err);
      res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, mailboxId, timezone } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Campaign name is required' });
        return;
      }

      const id = await CampaignModel.create(req.user!.userId, {
        name,
        description,
        mailboxId,
        timezone,
      });

      const campaign = await CampaignModel.findById(id, req.user!.userId);
      res.status(201).json({ campaign });
    } catch (err) {
      console.error('Create campaign error:', err);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await CampaignModel.update(id, req.user!.userId, req.body);

      if (!updated) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      const campaign = await CampaignModel.findById(id, req.user!.userId);
      res.json({ campaign });
    } catch (err) {
      console.error('Update campaign error:', err);
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await CampaignModel.delete(id, req.user!.userId);

      if (!deleted) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json({ message: 'Campaign deleted' });
    } catch (err) {
      console.error('Delete campaign error:', err);
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  },

  // --- Steps ---
  async addStep(req: AuthRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const campaign = await CampaignModel.findById(campaignId, req.user!.userId);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      const { subject, body, delayDays } = req.body;
      if (!subject || !body) {
        res.status(400).json({ error: 'Subject and body are required' });
        return;
      }

      const stepId = await StepModel.create(campaignId, {
        subject,
        body,
        delayDays: delayDays || 1,
      });

      const step = await StepModel.findById(stepId);
      res.status(201).json({ step });
    } catch (err) {
      console.error('Add step error:', err);
      res.status(500).json({ error: 'Failed to add step' });
    }
  },

  async updateStep(req: AuthRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const stepId = parseInt(req.params.stepId, 10);

      // verify ownership
      const campaign = await CampaignModel.findById(campaignId, req.user!.userId);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      const updated = await StepModel.update(stepId, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Step not found' });
        return;
      }

      const step = await StepModel.findById(stepId);
      res.json({ step });
    } catch (err) {
      console.error('Update step error:', err);
      res.status(500).json({ error: 'Failed to update step' });
    }
  },

  async deleteStep(req: AuthRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const stepId = parseInt(req.params.stepId, 10);

      const campaign = await CampaignModel.findById(campaignId, req.user!.userId);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      await StepModel.delete(stepId);
      res.json({ message: 'Step deleted' });
    } catch (err) {
      console.error('Delete step error:', err);
      res.status(500).json({ error: 'Failed to delete step' });
    }
  },

  // --- Leads ---
  async getLeads(req: AuthRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 50;

      const campaign = await CampaignModel.findById(campaignId, req.user!.userId);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      const result = await LeadModel.findByCampaign(campaignId, page, limit);
      res.json({ leads: result.leads, total: result.total, page, limit });
    } catch (err) {
      console.error('Get leads error:', err);
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  },

  async importLeads(req: AuthRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id, 10);

      const campaign = await CampaignModel.findById(campaignId, req.user!.userId);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'CSV file is required' });
        return;
      }

      const leads = await parseCsv(req.file.buffer);
      if (leads.length === 0) {
        res.status(400).json({ error: 'No valid leads found in CSV' });
        return;
      }

      const result = await LeadModel.bulkInsert(
        campaignId,
        leads.map((l) => ({
          email: l.email,
          first_name: l.first_name || null,
          last_name: l.last_name || null,
          company: l.company || null,
          custom_fields: (() => {
            const { email, first_name, last_name, company, ...rest } = l;
            return Object.keys(rest).length > 0 ? rest as Record<string, string> : null;
          })(),
        }))
      );

      res.json({
        message: 'Import complete',
        imported: result.inserted,
        duplicates: result.duplicates,
        total: leads.length,
      });
    } catch (err) {
      console.error('Import leads error:', err);
      res.status(500).json({ error: 'Failed to import leads' });
    }
  },

  // --- Launch ---
  async launch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const result = await CampaignService.launch(campaignId, req.user!.userId);
      res.json({ message: 'Campaign launched', queued: result.queued });
    } catch (err: any) {
      console.error('Launch error:', err);
      res.status(400).json({ error: err.message });
    }
  },

  // --- Analytics ---
  async analytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id, 10);

      const campaign = await CampaignModel.findById(campaignId, req.user!.userId);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      const analytics = await EmailLogModel.getAnalytics(campaignId);
      res.json({ analytics });
    } catch (err) {
      console.error('Analytics error:', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },
};
