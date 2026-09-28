import nodemailer from 'nodemailer';
import { emailQueue } from '../services/campaign.service';
import { EmailLogModel } from '../models/emailLog.model';
import { LeadModel } from '../models/lead.model';
import { MailboxModel } from '../models/mailbox.model';
import { injectTracking } from '../utils/tracking';
import env from '../config/env';
import { EmailJobData } from '../types';
import redis from '../config/redis';

console.log('Starting email worker...');

// rate limiter key per mailbox
function rateLimitKey(mailboxId: number): string {
  return `mailflow:ratelimit:${mailboxId}`;
}

async function checkRateLimit(mailboxId: number): Promise<boolean> {
  const key = rateLimitKey(mailboxId);
  const count = await redis.get(key);

  if (count && parseInt(count, 10) >= env.rateLimits.emailsPerMailboxPerHour) {
    return false; // limit reached
  }

  return true;
}

async function incrementRateLimit(mailboxId: number): Promise<void> {
  const key = rateLimitKey(mailboxId);
  const multi = redis.multi();
  multi.incr(key);
  multi.expire(key, 3600); // 1 hour TTL
  await multi.exec();
}

// process jobs
emailQueue.process(5, async (job) => {
  const data = job.data as EmailJobData;

  // check rate limit before sending
  const allowed = await checkRateLimit(data.mailboxId);
  if (!allowed) {
    // put it back with a delay
    throw new Error(`Rate limit hit for mailbox ${data.mailboxId}`);
  }

  try {
    // get SMTP credentials
    // note: we can't use the regular model here since we don't have userId context
    // so we query directly (the worker is trusted)
    const pool = (await import('../config/database')).default;
    const [rows] = await pool.execute(
      'SELECT smtp_host, smtp_port, smtp_user, smtp_pass FROM mailboxes WHERE id = ?',
      [data.mailboxId]
    );
    const mailbox = (rows as any[])[0];

    if (!mailbox) {
      throw new Error(`Mailbox ${data.mailboxId} not found`);
    }

    const transporter = nodemailer.createTransport({
      host: mailbox.smtp_host,
      port: mailbox.smtp_port,
      secure: mailbox.smtp_port === 465,
      auth: {
        user: mailbox.smtp_user,
        pass: mailbox.smtp_pass,
      },
    });

    // wrap body in basic HTML and inject tracking pixel
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${data.body.replace(/\n/g, '<br>')}
        </body>
      </html>
    `;
    const trackedHtml = injectTracking(htmlBody, data.trackingId);

    await transporter.sendMail({
      from: mailbox.smtp_user,
      to: data.to,
      subject: data.subject,
      html: trackedHtml,
    });

    // mark as sent
    await EmailLogModel.markSent(data.emailLogId);
    await incrementRateLimit(data.mailboxId);
    await LeadModel.incrementStep(data.leadId);

    console.log(`✓ Sent email to ${data.to} [campaign:${data.campaignId}, step:${data.stepId}]`);

    return { success: true };
  } catch (err: any) {
    console.error(`✗ Failed to send to ${data.to}:`, err.message);
    await EmailLogModel.markFailed(data.emailLogId, err.message);
    throw err; // let Bull handle retry
  }
});

emailQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

emailQueue.on('error', (err) => {
  console.error('Queue error:', err.message);
});

console.log('✓ Email worker started, waiting for jobs...');
