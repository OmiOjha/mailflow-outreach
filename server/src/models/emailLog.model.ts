import pool from '../config/database';
import { EmailLog, CampaignAnalytics, StepAnalytics } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const EmailLogModel = {
  async create(data: {
    leadId: number;
    campaignId: number;
    stepId: number;
    mailboxId: number;
  }): Promise<{ id: number; trackingId: string }> {
    const trackingId = uuidv4();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO email_logs (lead_id, campaign_id, step_id, mailbox_id, tracking_id)
       VALUES (?, ?, ?, ?, ?)`,
      [data.leadId, data.campaignId, data.stepId, data.mailboxId, trackingId]
    );
    return { id: result.insertId, trackingId };
  },

  async findByTrackingId(trackingId: string): Promise<EmailLog | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM email_logs WHERE tracking_id = ?',
      [trackingId]
    );
    return (rows[0] as EmailLog) || null;
  },

  async markSent(id: number): Promise<void> {
    await pool.execute(
      `UPDATE email_logs SET status = 'sent', sent_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  async markOpened(trackingId: string): Promise<void> {
    await pool.execute(
      `UPDATE email_logs SET status = 'opened', opened_at = NOW() 
       WHERE tracking_id = ? AND opened_at IS NULL`,
      [trackingId]
    );
  },

  async markClicked(trackingId: string): Promise<void> {
    // first mark as clicked if not already
    await pool.execute(
      `UPDATE email_logs SET status = 'clicked', clicked_at = NOW() 
       WHERE tracking_id = ? AND clicked_at IS NULL`,
      [trackingId]
    );
  },

  async markFailed(id: number, errorMessage: string): Promise<void> {
    await pool.execute(
      `UPDATE email_logs SET status = 'failed', error_message = ?, retry_count = retry_count + 1 
       WHERE id = ?`,
      [errorMessage, id]
    );
  },

  async getAnalytics(campaignId: number): Promise<CampaignAnalytics> {
    // total leads
    const [leadCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM leads WHERE campaign_id = ?',
      [campaignId]
    );
    const totalLeads = (leadCount[0] as any).total;

    // aggregate email stats
    const [stats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_sent,
        SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as total_opened,
        SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as total_clicked,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as total_bounced
       FROM email_logs 
       WHERE campaign_id = ? AND status != 'queued'`,
      [campaignId]
    );

    const s = stats[0] as any;
    const sent = s.total_sent || 0;
    const opened = s.total_opened || 0;
    const clicked = s.total_clicked || 0;
    const bounced = s.total_bounced || 0;

    // per-step breakdown
    const [stepStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        cs.id as step_id, cs.step_order, cs.subject,
        COUNT(el.id) as sent,
        SUM(CASE WHEN el.opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN el.clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked
       FROM campaign_steps cs
       LEFT JOIN email_logs el ON el.step_id = cs.id AND el.status != 'queued'
       WHERE cs.campaign_id = ?
       GROUP BY cs.id, cs.step_order, cs.subject
       ORDER BY cs.step_order ASC`,
      [campaignId]
    );

    const stepBreakdown: StepAnalytics[] = (stepStats as any[]).map((row) => ({
      stepId: row.step_id,
      stepOrder: row.step_order,
      subject: row.subject,
      sent: row.sent || 0,
      opened: row.opened || 0,
      clicked: row.clicked || 0,
      openRate: row.sent > 0 ? Math.round((row.opened / row.sent) * 100) : 0,
      clickRate: row.sent > 0 ? Math.round((row.clicked / row.sent) * 100) : 0,
    }));

    return {
      totalLeads,
      emailsSent: sent,
      emailsOpened: opened,
      emailsClicked: clicked,
      emailsBounced: bounced,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
      bounceRate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
      stepBreakdown,
    };
  },
};
