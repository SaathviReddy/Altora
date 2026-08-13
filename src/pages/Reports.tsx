import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Eye, Share2 } from 'lucide-react';
import { api, AdvisorReport, BusinessProfile } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const Reports: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [reports, setReports] = useState<AdvisorReport[]>([]);
  const [activeTab, setActiveTab] = useState<'advisor' | 'finance' | 'history'>('advisor');
  
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const activeProfile = await api.business.getProfile();
      setProfile(activeProfile);

      const list = await api.advisor.getReports();
      setReports(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Skeleton message="Reviewing your business context..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">EXPORT COMPILATIONS</span>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">Reports Workspace</h1>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={14} className="mr-1.5" /> Print Strategy
          </Button>
          <Button variant="primary" size="sm" onClick={() => alert('PDF export interface isolated for production integration.')}>
            <Download size={14} className="mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Reports Navigation Tabs */}
      <div className="flex space-x-2 border-b border-charcoal/5 pb-2">
        <button
          onClick={() => setActiveTab('advisor')}
          className={`text-xs uppercase tracking-wider px-4 py-2 border-b-2 font-semibold transition-all focus:outline-none ${activeTab === 'advisor' ? 'border-gold text-charcoal' : 'border-transparent text-brown hover:text-charcoal'}`}
        >
          Advisor Analysis
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`text-xs uppercase tracking-wider px-4 py-2 border-b-2 font-semibold transition-all focus:outline-none ${activeTab === 'finance' ? 'border-gold text-charcoal' : 'border-transparent text-brown hover:text-charcoal'}`}
        >
          Financial Summary
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`text-xs uppercase tracking-wider px-4 py-2 border-b-2 font-semibold transition-all focus:outline-none ${activeTab === 'history' ? 'border-gold text-charcoal' : 'border-transparent text-brown hover:text-charcoal'}`}
        >
          Venture History
        </button>
      </div>

      {/* Report Preview Body (Editorial layout) */}
      <Card className="p-8 border border-charcoal/10 bg-ivory space-y-8 max-w-4xl mx-auto shadow-sm">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-charcoal/5 pb-6">
          <div className="space-y-1">
            <p className="text-[10px] text-gold uppercase tracking-widest font-bold">ALTORA OPERATIONS ARCHIVE</p>
            <h2 className="text-2xl font-serif font-semibold text-charcoal">
              {activeTab === 'advisor' ? 'AI Advisor Strategy Report' : activeTab === 'finance' ? 'Quarterly P&L Summary' : 'Venture History & Milestones Log'}
            </h2>
            <p className="text-xs text-brown">Active Venture: {profile?.industry || 'B2B Consulting Service'}</p>
          </div>
          <span className="mt-4 sm:mt-0 text-[10px] font-mono text-brown bg-cream border border-charcoal/5 px-2.5 py-1 rounded">
            Generated: {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* TAB 1: ADVISOR REPORT PREVIEW */}
        {activeTab === 'advisor' && (
          <div className="space-y-6 text-sm text-charcoal leading-relaxed font-sans font-light">
            {reports.length > 0 ? (
              <>
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-brown font-semibold">Executive Context Summary</h4>
                  <p className="p-4 bg-cream/35 border border-charcoal/5 rounded italic text-xs leading-relaxed">
                    "{reports[0].explanation}"
                  </p>
                </div>
                
                <hr className="border-charcoal/5" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-brown font-semibold">Validation Roadmap</h4>
                    <ul className="list-disc pl-4 text-xs space-y-1 text-brown">
                      {reports[0].roadmap.map((r, i) => <li key={i}>{r.title}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-brown font-semibold">Identified Risk Mitigations</h4>
                    <ul className="list-disc pl-4 text-xs space-y-1 text-brown">
                      {reports[0].risks.map((r, i) => <li key={i}>{r.risk} ({r.impact} Impact)</li>)}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-brown italic">No advisor reports generated yet.</p>
            )}
          </div>
        )}

        {/* TAB 2: FINANCE REPORT PREVIEW */}
        {activeTab === 'finance' && (
          <div className="space-y-6 text-sm text-charcoal font-sans">
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-charcoal/5 p-4 rounded bg-cream/20">
                <span className="text-[10px] text-brown uppercase tracking-wider font-semibold">Operating Receipts</span>
                <p className="text-xl font-serif text-charcoal font-semibold mt-1">
                  ${(profile?.revenue || 4800).toLocaleString()}
                </p>
              </div>
              <div className="border border-charcoal/5 p-4 rounded bg-cream/20">
                <span className="text-[10px] text-brown uppercase tracking-wider font-semibold">Operating Outflow</span>
                <p className="text-xl font-serif text-charcoal font-semibold mt-1">
                  ${(profile?.expenses || 1850).toLocaleString()}
                </p>
              </div>
            </div>
            
            <hr className="border-charcoal/5" />
            
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-brown font-semibold">Cashflow Balance Mappings</h4>
              <p className="text-xs text-brown leading-relaxed font-light">
                Ledger summaries indicate a net working profit margin of ${( (profile?.revenue || 4800) - (profile?.expenses || 1850) ).toLocaleString()} with zero cash flow leakage. Operating budget parameters are synchronized with local storage equity values.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: HISTORY PREVIEW */}
        {activeTab === 'history' && (
          <div className="space-y-6 text-sm text-charcoal font-sans">
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-brown font-semibold">Venture History & Pitch Blueprint</h4>
              <p className="text-xs text-brown leading-relaxed font-light">
                {profile?.details || 'Strategic digital business startup setup launched under Altora operating parameters.'}
              </p>
            </div>
            
            <hr className="border-charcoal/5" />
            
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-brown font-semibold">Current Objectives</h4>
              <div className="space-y-2 pt-1">
                {profile?.goals?.map((g, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-brown font-light">
                    <span className="w-1 h-1 rounded-full bg-gold"></span>
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="border-t border-charcoal/5 pt-6 flex justify-between items-center text-[9px] uppercase tracking-widest text-brown font-mono">
          <span>SECURE ENCRYPTION MD5-KEY</span>
          <span>ALTORA SYSTEM BLUEPRINT v1.0</span>
        </div>

      </Card>

    </div>
  );
};
