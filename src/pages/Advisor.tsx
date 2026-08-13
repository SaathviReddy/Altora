import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, CheckSquare, Layers, ShieldAlert, Award } from 'lucide-react';
import { api, AdvisorReport, BusinessProfile } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const Advisor: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [reports, setReports] = useState<AdvisorReport[]>([]);
  const [activeReport, setActiveReport] = useState<AdvisorReport | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const activeProfile = await api.business.getProfile();
      setProfile(activeProfile);

      const list = await api.advisor.getReports();
      setReports(list);
      if (list.length > 0) {
        setActiveReport(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateNewReport = async () => {
    if (!profile) return;
    setGenerating(true);
    setSaveStatus(null);
    
    // Simulate deep context analysis delays
    setTimeout(async () => {
      try {
        const newReport = api.advisor.generateMockReport(profile);
        
        // Save report to database
        const reportsList = await api.advisor.getReports();
        reportsList.unshift(newReport);
        localStorage.setItem('altora_reports', JSON.stringify(reportsList));
        
        setReports(reportsList);
        setActiveReport(newReport);
      } catch (err) {
        console.error(err);
      } finally {
        setGenerating(false);
      }
    }, 1500);
  };

  const handleSaveToMemory = async () => {
    if (!activeReport) return;
    setSaveStatus('Saving report blueprint...');
    
    try {
      await api.advisor.saveToMemory(activeReport);
      setSaveStatus('Successfully saved to Memory timeline.');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('Error saving report.');
    }
  };

  if (loading) {
    return <Skeleton message="Reviewing your business context..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">AI STRATEGIST</span>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">Strategic Advisor</h1>
        </div>
        <Button 
          variant="primary" 
          onClick={handleGenerateNewReport}
          disabled={generating}
          className="mt-4 sm:mt-0"
        >
          <Sparkles size={14} className="mr-2" /> 
          {generating ? 'Analyzing Context...' : 'Re-Analyze Strategy'}
        </Button>
      </div>

      {generating && (
        <Skeleton message="Connecting your goals to the opportunity..." className="my-6" />
      )}

      {!generating && activeReport && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Historical Reports List */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-2">Generated Reports</h4>
            <div className="space-y-2.5">
              {reports.map((rep) => (
                <button
                  key={rep.id}
                  onClick={() => { setActiveReport(rep); setSaveStatus(null); }}
                  className={`w-full text-left p-3.5 border rounded transition-all text-xs focus:outline-none ${activeReport?.id === rep.id ? 'border-gold bg-ivory font-semibold text-charcoal shadow-[inset_0_1px_2px_rgba(26,26,26,0.01)]' : 'border-charcoal/5 bg-ivory/50 text-brown hover:border-charcoal/20'}`}
                >
                  <div className="truncate font-medium">{rep.title}</div>
                  <div className="text-[10px] text-brown/70 mt-1">{new Date(rep.createdAt).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Structured Slide Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Slide Header: Score and Summary */}
            <Card className="p-8 border border-charcoal/10 bg-ivory space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif font-semibold text-charcoal mb-1">
                    {activeReport.title}
                  </h2>
                  <span className="text-xs text-brown">{new Date(activeReport.createdAt).toLocaleDateString()}</span>
                </div>
                
                {/* Score badge */}
                <div className="mt-4 sm:mt-0 flex items-center space-x-3 bg-cream border border-gold/30 px-5 py-3 rounded">
                  <div>
                    <span className="text-2xl font-serif font-bold text-charcoal">{activeReport.assessmentScore}</span>
                    <span className="text-xs text-brown font-medium"> / 100</span>
                  </div>
                  <div className="border-l border-gold/30 h-8 pl-3 flex flex-col justify-center text-[9px] uppercase tracking-wider text-brown font-bold">
                    <span>Opportunity</span>
                    <span>Score</span>
                  </div>
                </div>
              </div>

              <hr className="border-charcoal/5" />

              <div>
                <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-2">Executive Hypothesis Assessment</h4>
                <p className="text-sm text-charcoal leading-relaxed font-light font-sans">
                  {activeReport.explanation}
                </p>
              </div>

              {saveStatus && (
                <div className="mt-4 p-3 bg-cream border border-gold/30 rounded text-xs text-brown font-medium">
                  {saveStatus}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleSaveToMemory}>
                  <Brain size={14} className="mr-1.5 text-gold" /> Save to Memory
                </Button>
                <Button variant="primary" size="sm" onClick={() => {
                  api.memory.addMemory('Tasks', `Actioned Strategy Recommendation: ${activeReport.title}`, `Next actions logged to your Tasks timeline.`);
                  setSaveStatus('Actions pushed to Tasks workspace.');
                  setTimeout(() => setSaveStatus(null), 3000);
                }}>
                  <CheckSquare size={14} className="mr-1.5" /> Deploy Tasks to Workspace
                </Button>
              </div>
            </Card>

            {/* Slide Body: Market & Model details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Market Opportunity */}
              <Card className="p-6 border border-charcoal/5 bg-ivory space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
                  Market & Target Customers
                </h4>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Target Audience</span>
                  <p className="text-xs text-charcoal mt-1 leading-relaxed">{activeReport.targetCustomer}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Niche Opportunity</span>
                  <p className="text-xs text-charcoal mt-1 leading-relaxed">{activeReport.marketOpportunity}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Competitive Landscape</span>
                  <p className="text-xs text-charcoal mt-1 leading-relaxed">{activeReport.competition}</p>
                </div>
              </Card>

              {/* Financial Model */}
              <Card className="p-6 border border-charcoal/5 bg-ivory space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
                  Pricing & Business Model
                </h4>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Revenue Mechanics</span>
                  <p className="text-xs text-charcoal mt-1 leading-relaxed">{activeReport.revenueModel}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Target Price Strategy</span>
                  <p className="text-xs text-charcoal mt-1 leading-relaxed">{activeReport.pricing}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Operating Costs Context</span>
                  <p className="text-xs text-charcoal mt-1 leading-relaxed">{activeReport.costs}</p>
                </div>
              </Card>
            </div>

            {/* SWOT Quadrant Structure */}
            <Card className="p-6 border border-charcoal/5 bg-ivory space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
                SWOT Matrix Mappings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-cream/35 border border-charcoal/5 rounded space-y-2">
                  <h5 className="text-xs font-serif font-bold text-green-800 uppercase tracking-wider">Strengths</h5>
                  <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                    {activeReport.swot.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
                <div className="p-4 bg-cream/35 border border-charcoal/5 rounded space-y-2">
                  <h5 className="text-xs font-serif font-bold text-red-800 uppercase tracking-wider">Weaknesses</h5>
                  <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                    {activeReport.swot.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
                  </ul>
                </div>
                <div className="p-4 bg-cream/35 border border-charcoal/5 rounded space-y-2">
                  <h5 className="text-xs font-serif font-bold text-gold uppercase tracking-wider font-semibold">Opportunities</h5>
                  <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                    {activeReport.swot.opportunities.map((o, idx) => <li key={idx}>{o}</li>)}
                  </ul>
                </div>
                <div className="p-4 bg-cream/35 border border-charcoal/5 rounded space-y-2">
                  <h5 className="text-xs font-serif font-bold text-brown uppercase tracking-wider">Threats</h5>
                  <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                    {activeReport.swot.threats.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Structured Launch Roadmap */}
            <Card className="p-6 border border-charcoal/5 bg-ivory space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2 flex items-center">
                <Layers size={14} className="mr-2 text-gold animate-pulse" /> Launch Implementation Roadmap
              </h4>
              
              <div className="space-y-6 pt-2">
                {activeReport.roadmap.map((phase, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0">
                    {/* Left title column */}
                    <div className="sm:w-1/3 pr-4 flex items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gold uppercase font-bold tracking-wider">{phase.phase}</span>
                        <span className="text-sm font-serif font-semibold text-charcoal mt-0.5">{phase.title}</span>
                      </div>
                    </div>
                    {/* Right tasks bullet list */}
                    <div className="sm:w-2/3 pl-0 sm:pl-4 border-l border-charcoal/5 space-y-2">
                      {phase.tasks.map((task, tidx) => (
                        <div key={tidx} className="flex items-center space-x-2 text-xs text-brown">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risk Mitigation Table */}
            <Card className="p-6 border border-charcoal/5 bg-ivory space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2 flex items-center">
                <ShieldAlert size={14} className="mr-2 text-brown" /> Operational Risk Matrix
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-charcoal">
                  <thead>
                    <tr className="border-b border-charcoal/10 font-serif font-semibold text-brown">
                      <th className="pb-3 pr-4">Identified Threat</th>
                      <th className="pb-3 px-4">Severity</th>
                      <th className="pb-3 pl-4">Mitigation Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5">
                    {activeReport.risks.map((r, idx) => (
                      <tr key={idx} className="hover:bg-cream/10">
                        <td className="py-3.5 pr-4 font-semibold">{r.risk}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${r.impact === 'High' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
                            {r.impact}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-brown font-light">{r.mitigation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
};
