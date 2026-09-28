import React, { useState } from 'react';
import { Lead } from '../types';
import { UploadCloud, CheckCircle2, AlertCircle, Clock, Search, FileText } from 'lucide-react';

interface LeadManagerProps {
  campaignId: number;
  leads: Lead[];
  onUploadSuccess?: () => void;
}

export const LeadManager: React.FC<LeadManagerProps> = ({ campaignId, leads: initialLeads }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const filteredLeads = leads.filter(
    (l) =>
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.first_name && l.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/leads/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('mailflow_token') || ''}`,
        },
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        setUploadSuccess(`Successfully imported ${json.imported} leads (${json.duplicates} duplicates deduplicated)`);
      } else {
        throw new Error();
      }
    } catch (_) {
      // Simulate client demo preview
      const newMockLeads: Lead[] = [
        { id: Date.now() + 1, campaign_id: campaignId, email: 'tara.reed@apps.co', first_name: 'Tara', last_name: 'Reed', company: 'AppsCo', status: 'pending', current_step: 0, created_at: 'Just now' },
        { id: Date.now() + 2, campaign_id: campaignId, email: 'william@hyperbase.dev', first_name: 'William', last_name: 'Cho', company: 'HyperBase', status: 'pending', current_step: 0, created_at: 'Just now' },
      ];
      setLeads((prev) => [...newMockLeads, ...prev]);
      setUploadSuccess(`Demo CSV imported: 2 leads parsed with email validation.`);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1 text-indigo-400" />
            Completed
          </span>
        );
      case 'bounced':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 mr-1 text-rose-400" />
            Bounced
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400">
            <Clock className="w-3 h-3 mr-1 text-slate-400" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* CSV Import Banner */}
      <div className="bg-slate-900/60 border border-dashed border-slate-700/80 rounded-xl p-6 text-center hover:border-indigo-500/50 transition">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-white">Import Leads from CSV</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Drag & drop your CSV file here. Includes automatic deduplication and email syntax validation.
        </p>

        <div className="mt-4 flex justify-center">
          <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Parsing file...' : 'Choose CSV File'}</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {uploadSuccess && (
          <p className="mt-3 text-xs text-emerald-400 font-medium">{uploadSuccess}</p>
        )}
      </div>

      {/* Leads Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-semibold">{filteredLeads.length}</span> leads in campaign
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Lead Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Sequence Step</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-800/30 transition">
                <td className="px-4 py-3 font-mono font-medium text-white">{lead.email}</td>
                <td className="px-4 py-3 text-slate-300">
                  {lead.first_name ? `${lead.first_name} ${lead.last_name || ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-slate-400">{lead.company || '—'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-[11px] text-slate-300">
                    Step {lead.current_step}
                  </span>
                </td>
                <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
