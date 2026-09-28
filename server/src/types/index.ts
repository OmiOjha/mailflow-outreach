import { Request } from 'express';

// ---- Auth ----
export interface AuthPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

// ---- User ----
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// ---- Mailbox ----
export interface Mailbox {
  id: number;
  user_id: number;
  email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  daily_limit: number;
  is_active: boolean;
  created_at: Date;
}

export interface CreateMailboxBody {
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  dailyLimit?: number;
}

// ---- Campaign ----
export interface Campaign {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  mailbox_id: number | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  timezone: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCampaignBody {
  name: string;
  description?: string;
  mailboxId?: number;
  timezone?: string;
}

export interface UpdateCampaignBody {
  name?: string;
  description?: string;
  mailboxId?: number;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  timezone?: string;
}

// ---- Campaign Step ----
export interface CampaignStep {
  id: number;
  campaign_id: number;
  step_order: number;
  subject: string;
  body: string;
  delay_days: number;
  created_at: Date;
}

export interface CreateStepBody {
  subject: string;
  body: string;
  delayDays: number;
}

export interface UpdateStepBody {
  subject?: string;
  body?: string;
  delayDays?: number;
}

// ---- Lead ----
export interface Lead {
  id: number;
  campaign_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  custom_fields: Record<string, string> | null;
  status: 'pending' | 'active' | 'completed' | 'bounced' | 'unsubscribed';
  current_step: number;
  created_at: Date;
}

// ---- Email Log ----
export interface EmailLog {
  id: number;
  lead_id: number;
  campaign_id: number;
  step_id: number;
  mailbox_id: number | null;
  tracking_id: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  opened_at: Date | null;
  clicked_at: Date | null;
  sent_at: Date | null;
  error_message: string | null;
  retry_count: number;
  created_at: Date;
}

// ---- Analytics ----
export interface CampaignAnalytics {
  totalLeads: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsBounced: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  stepBreakdown: StepAnalytics[];
}

export interface StepAnalytics {
  stepId: number;
  stepOrder: number;
  subject: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

// ---- Email Job (Bull Queue) ----
export interface EmailJobData {
  emailLogId: number;
  leadId: number;
  campaignId: number;
  stepId: number;
  mailboxId: number;
  to: string;
  subject: string;
  body: string;
  trackingId: string;
}
