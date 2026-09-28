import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CampaignDetail } from './pages/CampaignDetail';
import { MailboxSettings } from './components/MailboxSettings';
import { CampaignModal } from './components/CampaignModal';
import { api } from './services/api';
import { Campaign, CampaignStep, Lead, Mailbox, Analytics } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [steps, setSteps] = useState<CampaignStep[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalLeads: 525,
    emailsSent: 378,
    emailsOpened: 241,
    emailsClicked: 87,
    emailsBounced: 8,
    openRate: 64,
    clickRate: 23,
    bounceRate: 2,
    stepBreakdown: [],
  });
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);

  useEffect(() => {
    async function loadData() {
      const campList = await api.getCampaigns();
      setCampaigns(campList);

      const mbList = await api.getMailboxes();
      setMailboxes(mbList);
    }
    loadData();
  }, []);

  const handleSelectCampaign = async (id: number) => {
    setSelectedCampaignId(id);
    const detail = await api.getCampaign(id);
    setCurrentCampaign(detail.campaign);
    setSteps(detail.steps);
    setLeads(detail.leads.data);

    const a = await api.getAnalytics(id);
    setAnalytics(a);
  };

  const handleBackToDashboard = () => {
    setSelectedCampaignId(null);
    setCurrentCampaign(null);
  };

  const handleCreateCampaign = async (data: { name: string; description: string }) => {
    const newCamp = await api.createCampaign(data);
    setCampaigns((prev) => [newCamp, ...prev]);
    handleSelectCampaign(newCamp.id);
  };

  const handleAddStep = async (stepData: { subject: string; body: string; delayDays: number }) => {
    if (!selectedCampaignId) return;
    const newStep = await api.addStep(selectedCampaignId, stepData);
    setSteps((prev) => [...prev, newStep]);
  };

  const handleLaunchCampaign = async () => {
    if (!selectedCampaignId) return;
    await api.launchCampaign(selectedCampaignId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'dashboard' || tab === 'campaigns') {
            handleBackToDashboard();
          }
        }}
        onNewCampaign={() => setIsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedCampaignId && currentCampaign ? (
          <CampaignDetail
            campaign={currentCampaign}
            steps={steps}
            leads={leads}
            analytics={analytics}
            onBack={handleBackToDashboard}
            onAddStep={handleAddStep}
            onLaunch={handleLaunchCampaign}
          />
        ) : currentTab === 'mailboxes' ? (
          <MailboxSettings
            mailboxes={mailboxes}
            onAddMailbox={(mb) => setMailboxes((prev) => [...prev, mb])}
          />
        ) : (
          <Dashboard
            campaigns={campaigns}
            analytics={analytics}
            onSelectCampaign={handleSelectCampaign}
            onNewCampaign={() => setIsModalOpen(true)}
          />
        )}
      </main>

      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCampaign}
      />

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>MailFlow Platform · Built with TypeScript, Node.js, Express, MySQL, Redis, Bull & React</p>
      </footer>
    </div>
  );
};

export default App;
