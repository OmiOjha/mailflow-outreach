import Bull from 'bull';
import env from '../config/env';
import { CampaignModel } from '../models/campaign.model';
import { StepModel } from '../models/step.model';
import { LeadModel } from '../models/lead.model';
import { EmailLogModel } from '../models/emailLog.model';
import { MailboxModel } from '../models/mailbox.model';
import { renderTemplate } from '../utils/tracking';
import { EmailJobData } from '../types';

const emailQueue = new Bull<EmailJobData>('email-sending', {
  redis: {
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
  },
  defaultJobOptions: {
    attempts: env.rateLimits.maxRetries,
    backoff: {
      type: 'exponential',
      delay: 60000, // 1 min initial, then 2min, 4min
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const CampaignService = {
  /**
   * Launch a campaign: enqueue emails for all pending leads at their current step.
   */
  async launch(campaignId: number, userId: number): Promise<{ queued: number }> {
    const campaign = await CampaignModel.findById(campaignId, userId);
    if (!campaign) throw new Error('Campaign not found');
    if (!campaign.mailbox_id) throw new Error('No mailbox assigned to this campaign');

    const mailbox = await MailboxModel.findById(campaign.mailbox_id, userId);
    if (!mailbox) throw new Error('Mailbox not found');

    const steps = await StepModel.findByCampaign(campaignId);
    if (steps.length === 0) throw new Error('Campaign has no email steps');

    const leads = await LeadModel.findPendingForCampaign(campaignId);
    if (leads.length === 0) throw new Error('No pending leads found');

    let queued = 0;

    for (const lead of leads) {
      // find the step this lead is currently on
      const step = steps.find((s) => s.step_order === lead.current_step + 1);
      if (!step) continue; // lead has completed all steps

      // create email log entry
      const { id: emailLogId, trackingId } = await EmailLogModel.create({
        leadId: lead.id,
        campaignId,
        stepId: step.id,
        mailboxId: mailbox.id,
      });

      // personalize the template
      const variables: Record<string, string> = {
        firstName: lead.first_name || '',
        lastName: lead.last_name || '',
        company: lead.company || '',
        email: lead.email,
      };

      const subject = renderTemplate(step.subject, variables);
      const body = renderTemplate(step.body, variables);

      // calculate delay based on step order
      const delayMs = step.delay_days * 24 * 60 * 60 * 1000;

      await emailQueue.add(
        {
          emailLogId,
          leadId: lead.id,
          campaignId,
          stepId: step.id,
          mailboxId: mailbox.id,
          to: lead.email,
          subject,
          body,
          trackingId,
        },
        { delay: delayMs }
      );

      // update lead status to active
      await LeadModel.updateStatus(lead.id, 'active');
      queued++;
    }

    // mark campaign as active
    await CampaignModel.updateStatus(campaignId, 'active');

    return { queued };
  },
};

export { emailQueue };
