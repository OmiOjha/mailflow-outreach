export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Campaign {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  mailbox_id: number | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  timezone: string;
  lead_count?: number;
  step_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignStep {
  id: number;
  campaign_id: number;
  step_order: number;
  subject: string;
  body: string;
  delay_days: number;
}

export interface Lead {
  id: number;
  campaign_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  status: 'pending' | 'active' | 'completed' | 'bounced' | 'unsubscribed';
  current_step: number;
  created_at: string;
}

export interface Mailbox {
  id: number;
  email: string;
  smtp_host: string;
  smtp_port: number;
  daily_limit: number;
  is_active: boolean;
  created_at: string;
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

export interface Analytics {
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
