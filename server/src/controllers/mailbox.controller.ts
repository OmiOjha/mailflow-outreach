import { Response } from 'express';
import { MailboxModel } from '../models/mailbox.model';
import { AuthRequest } from '../types';

export const MailboxController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const mailboxes = await MailboxModel.findAllByUser(req.user!.userId);
      res.json({ mailboxes });
    } catch (err) {
      console.error('List mailboxes error:', err);
      res.status(500).json({ error: 'Failed to fetch mailboxes' });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, smtpHost, smtpPort, smtpUser, smtpPass, dailyLimit } = req.body;

      if (!email || !smtpHost || !smtpUser || !smtpPass) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const id = await MailboxModel.create(req.user!.userId, {
        email,
        smtpHost,
        smtpPort: smtpPort || 587,
        smtpUser,
        smtpPass,
        dailyLimit,
      });

      res.status(201).json({ id, message: 'Mailbox added' });
    } catch (err) {
      console.error('Create mailbox error:', err);
      res.status(500).json({ error: 'Failed to add mailbox' });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await MailboxModel.delete(id, req.user!.userId);

      if (!deleted) {
        res.status(404).json({ error: 'Mailbox not found' });
        return;
      }

      res.json({ message: 'Mailbox deleted' });
    } catch (err) {
      console.error('Delete mailbox error:', err);
      res.status(500).json({ error: 'Failed to delete mailbox' });
    }
  },

  async toggleActive(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { isActive } = req.body;

      const updated = await MailboxModel.toggleActive(id, req.user!.userId, isActive);
      if (!updated) {
        res.status(404).json({ error: 'Mailbox not found' });
        return;
      }

      res.json({ message: `Mailbox ${isActive ? 'activated' : 'deactivated'}` });
    } catch (err) {
      console.error('Toggle mailbox error:', err);
      res.status(500).json({ error: 'Failed to update mailbox' });
    }
  },
};
