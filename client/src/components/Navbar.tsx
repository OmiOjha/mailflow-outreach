import React from 'react';
import { Send, BarChart3, Inbox, Layers, Settings, ExternalLink } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNewCampaign: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onNewCampaign }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Send className="w-5 h-5 text-white transform -rotate-12 translate-x-0.5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                MailFlow
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold ml-2 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.2
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onTabChange('campaigns')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'campaigns'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Campaigns</span>
            </button>

            <button
              onClick={() => onTabChange('mailboxes')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'mailboxes'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Mailboxes & Limits</span>
            </button>

            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              <span>Swagger API</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onNewCampaign}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95"
            >
              + New Campaign
            </button>

            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center space-x-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
                OO
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-medium text-slate-200 leading-tight">Omi Ojha</div>
                <div className="text-slate-500 text-[11px]">Pro Outreach</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
