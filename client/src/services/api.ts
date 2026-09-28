import { Campaign, CampaignStep, Lead, Mailbox, Analytics } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('mailflow_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fallback dummy data for live preview / demo purposes
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    user_id: 1,
    name: 'SaaS Founders Outreach Q1',
    description: 'Cold outreach sequence targeting Series A B2B software founders',
    mailbox_id: 1,
    status: 'active',
    timezone: 'UTC',
    lead_count: 320,
    step_count: 3,
    created_at: '2026-09-10T10:00:00Z',
    updated_at: '2026-09-24T14:30:00Z',
  },
  {
    id: 2,
    user_id: 1,
    name: 'FinTech VP Engineering Follow-ups',
    description: 'Technical hiring and developer tooling introduction sequence',
    mailbox_id: 1,
    status: 'active',
    timezone: 'America/New_York',
    lead_count: 145,
    step_count: 4,
    created_at: '2026-09-15T08:20:00Z',
    updated_at: '2026-09-27T11:15:00Z',
  },
  {
    id: 3,
    user_id: 1,
    name: 'DevOps Agency Re-engagement',
    description: 'Re-activating past inbound agency leads with new pricing tiers',
    mailbox_id: 2,
    status: 'draft',
    timezone: 'Europe/London',
    lead_count: 60,
    step_count: 2,
    created_at: '2026-09-22T09:00:00Z',
    updated_at: '2026-09-22T09:00:00Z',
  },
];

const MOCK_STEPS: Record<number, CampaignStep[]> = {
  1: [
    {
      id: 101,
      campaign_id: 1,
      step_order: 1,
      subject: 'Quick question about {{company}} backend scaling',
      body: 'Hi {{firstName}},\n\nSaw how fast {{company}} has grown recently. We built an automated queue dispatch system that helped companies handle 10x email deliverability.\n\nWould you be open to a 5-min intro this Thursday?\n\nBest,\nOmi',
      delay_days: 0,
    },
    {
      id: 102,
      campaign_id: 1,
      step_order: 2,
      subject: 'Re: Quick question about {{company}} backend scaling',
      body: 'Hi {{firstName}},\n\nCircling back on this in case it got buried under your inbox. Here is a link to our live dashboard demo: https://mailflow.io/demo\n\nCheers!',
      delay_days: 3,
    },
    {
      id: 103,
      campaign_id: 1,
      step_order: 3,
      subject: 'Permission to close file for {{company}}?',
      body: 'Hey {{firstName}},\n\nI realize you must be super busy steering the ship at {{company}}. If now is not a good time, no worries at all!\n\nAll the best with Q4 goals.',
      delay_days: 5,
    },
  ],
};

const MOCK_LEADS: Record<number, Lead[]> = {
  1: [
    { id: 1, campaign_id: 1, email: 'satya@techcorp.io', first_name: 'Satya', last_name: 'Nadella', company: 'TechCorp', status: 'completed', current_step: 3, created_at: '2026-09-12' },
    { id: 2, campaign_id: 1, email: 'clara@finverse.com', first_name: 'Clara', last_name: 'Zhang', company: 'FinVerse', status: 'active', current_step: 2, created_at: '2026-09-14' },
    { id: 3, campaign_id: 1, email: 'marcus@cloudscale.net', first_name: 'Marcus', last_name: 'Vance', company: 'CloudScale', status: 'active', current_step: 1, created_at: '2026-09-16' },
    { id: 4, campaign_id: 1, email: 'elena@biopulse.org', first_name: 'Elena', last_name: 'Rostova', company: 'BioPulse', status: 'pending', current_step: 0, created_at: '2026-09-18' },
    { id: 5, campaign_id: 1, email: 'devin@invalid-domain-bounce.com', first_name: 'Devin', last_name: 'Ray', company: 'DevLabs', status: 'bounced', current_step: 1, created_at: '2026-09-19' },
  ],
};

const MOCK_ANALYTICS: Record<number, Analytics> = {
  1: {
    totalLeads: 320,
    emailsSent: 284,
    emailsOpened: 182,
    emailsClicked: 71,
    emailsBounced: 6,
    openRate: 64,
    clickRate: 25,
    bounceRate: 2,
    stepBreakdown: [
      { stepId: 101, stepOrder: 1, subject: 'Quick question about {{company}} backend scaling', sent: 120, opened: 82, clicked: 36, openRate: 68, clickRate: 30 },
      { stepId: 102, stepOrder: 2, subject: 'Re: Quick question about {{company}} backend scaling', sent: 94, opened: 59, clicked: 24, openRate: 62, clickRate: 25 },
      { stepId: 103, stepOrder: 3, subject: 'Permission to close file for {{company}}?', sent: 70, opened: 41, clicked: 11, openRate: 58, clickRate: 15 },
    ],
  },
};

const MOCK_MAILBOXES: Mailbox[] = [
  { id: 1, email: 'omi@outbox.mailflow.io', smtp_host: 'smtp.sendgrid.net', smtp_port: 587, daily_limit: 250, is_active: true, created_at: '2026-09-01' },
  { id: 2, email: 'outreach@growthmail.dev', smtp_host: 'smtp.mailgun.org', smtp_port: 587, daily_limit: 150, is_active: true, created_at: '2026-09-05' },
];

export const api = {
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const res = await fetch(`${API_BASE}/campaigns`, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        return data.campaigns;
      }
    } catch (_) {}
    return MOCK_CAMPAIGNS;
  },

  async getCampaign(id: number): Promise<{ campaign: Campaign; steps: CampaignStep[]; leads: { data: Lead[]; total: number } }> {
    try {
      const res = await fetch(`${API_BASE}/campaigns/${id}`, { headers: getAuthHeader() });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}

    const campaign = MOCK_CAMPAIGNS.find((c) => c.id === id) || MOCK_CAMPAIGNS[0];
    return {
      campaign,
      steps: MOCK_STEPS[id] || MOCK_STEPS[1],
      leads: { data: MOCK_LEADS[id] || MOCK_LEADS[1], total: 5 },
    };
  },

  async createCampaign(data: { name: string; description?: string }): Promise<Campaign> {
    try {
      const res = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.campaign;
      }
    } catch (_) {}

    const newCamp: Campaign = {
      id: Date.now(),
      user_id: 1,
      name: data.name,
      description: data.description || '',
      mailbox_id: 1,
      status: 'draft',
      timezone: 'UTC',
      lead_count: 0,
      step_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_CAMPAIGNS.unshift(newCamp);
    return newCamp;
  },

  async addStep(campaignId: number, step: { subject: string; body: string; delayDays: number }): Promise<CampaignStep> {
    try {
      const res = await fetch(`${API_BASE}/campaigns/${campaignId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(step),
      });
      if (res.ok) {
        const json = await res.json();
        return json.step;
      }
    } catch (_) {}

    const list = MOCK_STEPS[campaignId] || [];
    const newStep: CampaignStep = {
      id: Date.now(),
      campaign_id: campaignId,
      step_order: list.length + 1,
      subject: step.subject,
      body: step.body,
      delay_days: step.delayDays,
    };
    list.push(newStep);
    MOCK_STEPS[campaignId] = list;
    return newStep;
  },

  async getAnalytics(campaignId: number): Promise<Analytics> {
    try {
      const res = await fetch(`${API_BASE}/campaigns/${campaignId}/analytics`, { headers: getAuthHeader() });
      if (res.ok) {
        const json = await res.json();
        return json.analytics;
      }
    } catch (_) {}
    return MOCK_ANALYTICS[campaignId] || MOCK_ANALYTICS[1];
  },

  async getMailboxes(): Promise<Mailbox[]> {
    try {
      const res = await fetch(`${API_BASE}/mailboxes`, { headers: getAuthHeader() });
      if (res.ok) {
        const json = await res.json();
        return json.mailboxes;
      }
    } catch (_) {}
    return MOCK_MAILBOXES;
  },

  async launchCampaign(campaignId: number): Promise<{ message: string; queued: number }> {
    try {
      const res = await fetch(`${API_BASE}/campaigns/${campaignId}/launch`, {
        method: 'POST',
        headers: getAuthHeader(),
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { message: 'Outreach campaign dispatched into Redis queue', queued: 120 };
  },
};
