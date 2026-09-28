import React, { useState } from 'react';
import { CampaignStep } from '../types';
import { Clock, Plus } from 'lucide-react';

interface SequenceBuilderProps {
  steps: CampaignStep[];
  onAddStep: (step: { subject: string; body: string; delayDays: number }) => void;
}

export const SequenceBuilder: React.FC<SequenceBuilderProps> = ({ steps, onAddStep }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delayDays, setDelayDays] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;
    onAddStep({ subject, body, delayDays });
    setSubject('');
    setBody('');
    setDelayDays(2);
    setIsAdding(false);
  };

  const insertVariable = (variable: string) => {
    setBody((prev) => `${prev} {{${variable}}}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Outreach Email Sequence</h3>
          <p className="text-sm text-slate-400">
            Define multi-step follow-ups with customized day delays and dynamic lead variables.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sequence Step</span>
          </button>
        )}
      </div>

      {/* Step Sequence Timeline */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative group">
            {/* Step Node */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-indigo-500 bg-slate-950 flex items-center justify-center text-[10px] font-bold text-indigo-400">
              {idx + 1}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Step {step.step_order}
                  </span>
                  <div className="flex items-center text-xs text-slate-400 space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {step.delay_days === 0
                        ? 'Trigger immediately on launch'
                        : `Wait ${step.delay_days} days after previous step`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-200">
                  <span className="text-slate-500 font-normal mr-2">Subject:</span>
                  {step.subject}
                </div>
                <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
                  {step.body}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Step Form */}
        {isAdding && (
          <div className="relative">
            <div className="absolute -left-6 top-4 w-5 h-5 rounded-full border-2 border-emerald-500 bg-slate-950 flex items-center justify-center text-[10px] font-bold text-emerald-400">
              +
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-400">
                  New Follow-up Step #{steps.length + 1}
                </span>
                <div className="flex items-center space-x-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Wait:</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={delayDays}
                    onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                    className="w-14 bg-slate-950 border border-slate-700 px-2 py-1 rounded text-center text-white text-xs"
                  />
                  <span className="text-slate-400">days</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quick follow up regarding {{company}}"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">
                    Email Body Template
                  </label>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                    <span>Insert:</span>
                    {['firstName', 'company', 'email'].map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => insertVariable(v)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[10px]"
                      >
                        {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={4}
                  placeholder="Hi {{firstName}},\n\nJust wanted to follow up on our previous note..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow"
                >
                  Save Step
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
