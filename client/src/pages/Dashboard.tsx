import React from 'react';
import { Campaign, Analytics } from '../types';
import { StatsCard } from '../components/StatsCard';
import { Users, Send, Eye, MousePointerClick, AlertTriangle, ArrowRight, Play, CheckCircle } from 'lucide-react';

interface DashboardProps {
  campaigns: Campaign[];
  analytics: Analytics;
  onSelectCampaign: (id: number) => void;
  onNewCampaign: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  campaigns,
  analytics,
  onSelectCampaign,
  onNewCampaign,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Outreach Pipeline Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics across cold email campaigns, deliverability metrics, and queued background workers.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Redis Worker Online</span>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Leads"
          value={analytics.totalLeads.toLocaleString()}
          change="+18%"
          trend="up"
          icon={Users}
          subtitle="Imported via CSV batches"
        />
        <StatsCard
          title="Dispatched"
          value={analytics.emailsSent.toLocaleString()}
          change="+24%"
          trend="up"
          icon={Send}
          subtitle="Via Bull Queue & SMTP"
        />
        <StatsCard
          title="Open Rate"
          value={`${analytics.openRate}%`}
          change="+5.2%"
          trend="up"
          icon={Eye}
          subtitle={`${analytics.emailsOpened} pixel triggers`}
        />
        <StatsCard
          title="Click Rate"
          value={`${analytics.clickRate}%`}
          change="+2.1%"
          trend="up"
          icon={MousePointerClick}
          subtitle={`${analytics.emailsClicked} tracked link redirects`}
        />
        <StatsCard
          title="Bounce Rate"
          value={`${analytics.bounceRate}%`}
          change="Optimal < 3%"
          trend="neutral"
          icon={AlertTriangle}
          subtitle={`${analytics.emailsBounced} hard bounces`}
        />
      </div>

      {/* Campaign List Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Active & Draft Campaigns</h2>
            <p className="text-xs text-slate-400">Click any campaign to inspect sequences, leads, or funnel telemetry.</p>
          </div>
          <button
            onClick={onNewCampaign}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            + Create Campaign
          </button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Campaign Name</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Sequences</th>
                <th className="px-5 py-3.5">Enrolled Leads</th>
                <th className="px-5 py-3.5">Timezone</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCampaign(c.id)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white group-hover:text-indigo-400 transition">
                      {c.name}
                    </div>
                    {c.description && (
                      <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                        {c.description}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {c.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                        Running
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono">
                    {c.step_count || 3} steps
                  </td>
                  <td className="px-5 py-4 font-mono font-medium text-slate-200">
                    {c.lead_count || 120} leads
                  </td>
                  <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                    {c.timezone}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="inline-flex items-center space-x-1 text-slate-400 group-hover:text-indigo-400 transition font-medium text-xs">
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
