import React, { useState } from 'react';
import { Campaign, CampaignStep, Lead, Analytics } from '../types';
import { SequenceBuilder } from '../components/SequenceBuilder';
import { LeadManager } from '../components/LeadManager';
import { ArrowLeft, Rocket, Layers, Users, BarChart3, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface CampaignDetailProps {
  campaign: Campaign;
  steps: CampaignStep[];
  leads: Lead[];
  analytics: Analytics;
  onBack: () => void;
  onAddStep: (step: { subject: string; body: string; delayDays: number }) => void;
  onLaunch: () => Promise<void>;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  steps,
  leads,
  analytics,
  onBack,
  onAddStep,
  onLaunch,
}) => {
  const [activeTab, setActiveTab] = useState<'sequence' | 'leads' | 'analytics'>('sequence');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);

  const handleLaunchClick = async () => {
    setIsLaunching(true);
    try {
      await onLaunch();
      setLaunchMessage('Campaign successfully queued! Redis workers are dispatching emails.');
    } catch (_) {
      setLaunchMessage('Campaign dispatch failed.');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {campaign.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {campaign.description || 'Configured with automated follow-up sequences'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLaunchClick}
            disabled={isLaunching}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{isLaunching ? 'Queueing in Redis...' : 'Launch Campaign Sequence'}</span>
          </button>
        </div>
      </div>

      {launchMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{launchMessage}</span>
        </div>
      )}

      {/* Campaign Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('sequence')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'sequence'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sequences ({steps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'leads'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads & CSV Import ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Funnel Analytics</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'sequence' && (
        <SequenceBuilder steps={steps} onAddStep={onAddStep} />
      )}

      {activeTab === 'leads' && (
        <LeadManager campaignId={campaign.id} leads={leads} />
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Delivered</span>
              <div className="text-2xl font-bold text-white mt-1">{analytics.emailsSent}</div>
              <span className="text-[11px] text-slate-500">100% SMTP acknowledgement</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Unique Opens</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {analytics.openRate}% ({analytics.emailsOpened})
              </div>
              <span className="text-[11px] text-slate-500">Tracked via 1x1 GIF pixel</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Link Clicks</span>
              <div className="text-2xl font-bold text-indigo-400 mt-1">
                {analytics.clickRate}% ({analytics.emailsClicked})
              </div>
              <span className="text-[11px] text-slate-500">Tracked via HTTP 302 redirects</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Step-by-Step Funnel Conversion</span>
            </h3>

            <div className="space-y-4">
              {analytics.stepBreakdown.map((step) => (
                <div key={step.stepId} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-200">
                      Step {step.stepOrder}: <span className="text-slate-400">{step.subject}</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {step.sent} sent · <span className="text-emerald-400">{step.openRate}% open</span> · <span className="text-indigo-400">{step.clickRate}% click</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${step.openRate}%` }}
                      className="bg-emerald-500 h-full rounded-l-full"
                      title={`Open Rate: ${step.openRate}%`}
                    ></div>
                    <div
                      style={{ width: `${step.clickRate}%` }}
                      className="bg-indigo-500 h-full"
                      title={`Click Rate: ${step.clickRate}%`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
