import React, { useState } from 'react';
import { Mailbox } from '../types';
import { Mail, ShieldCheck, Plus, Zap } from 'lucide-react';

interface MailboxSettingsProps {
  mailboxes: Mailbox[];
  onAddMailbox: (mailbox: any) => void;
}

export const MailboxSettings: React.FC<MailboxSettingsProps> = ({ mailboxes: initialMailboxes, onAddMailbox }) => {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>(initialMailboxes);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [dailyLimit, setDailyLimit] = useState(200);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMailbox: Mailbox = {
      id: Date.now(),
      email,
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      daily_limit: dailyLimit,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setMailboxes([...mailboxes, newMailbox]);
    onAddMailbox(newMailbox);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Mailbox Configuration & Hourly Caps</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure SMTP providers and rate-limiting quotas to protect domain reputation and avoid spam filters.
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Connect SMTP Mailbox</span>
          </button>
        )}
      </div>

      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-xl space-y-4 max-w-xl"
        >
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Add SMTP Dispatch Sender</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sender Email</label>
              <input
                type="email"
                placeholder="outreach@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Port</label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SMTP Username</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SMTP Password</label>
              <input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Cap (Emails)</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value) || 200)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow"
            >
              Save Mailbox
            </button>
          </div>
        </form>
      )}

      {/* Mailbox List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mailboxes.map((mb) => (
          <div
            key={mb.id}
            className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{mb.email}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {mb.smtp_host}:{mb.smtp_port}
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                Warmed Up
              </span>
            </div>

            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Daily Deliverability Quota</span>
                <span className="font-semibold text-slate-200">{mb.daily_limit} emails/day</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[42%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>84 sent today</span>
                <span>{mb.daily_limit - 84} available</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
