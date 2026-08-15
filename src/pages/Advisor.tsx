import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, CheckSquare, Search, Download, ExternalLink, FileText, CheckCircle2, Loader2, Layers, ShieldAlert } from 'lucide-react';
import { api, AdvisorReport, BusinessProfile } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const Advisor: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [reports, setReports] = useState<AdvisorReport[]>([]);
  const [activeReport, setActiveReport] = useState<AdvisorReport | null>(null);
  const [viewMode, setViewMode] = useState<'brief' | 'pdf'>('brief');
  
  // Search Bar / Query state
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const formatDate = (rep: any) => {
    const val = rep?.createdAt || rep?.created_at;
    if (!val) return new Date().toLocaleDateString();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toLocaleDateString() : d.toLocaleDateString();
  };

  const getScore = (rep: any) => {
    return rep?.assessmentScore ?? rep?.assessment_score ?? rep?.score ?? 85;
  };

  const getPdfUrl = (rep: AdvisorReport | null) => {
    if (!rep) return '';
    return api.advisor.getReportPDFUrl(rep.id);
  };

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

    const handleWsEvent = (e: CustomEvent) => {
      const { type, action } = e.detail || {};
      if (type === 'advisor') {
        if (action === 'report.started') setGenerationStep('AI analysis started...');
        else if (action === 'report.generating') setGenerationStep('Generating structured business analysis...');
        else if (action === 'pdf.generating') setGenerationStep('Compiling multi-page vector PDF document...');
        else if (action === 'pdf.ready') setGenerationStep('PDF report ready!');
      }
    };

    window.addEventListener('altora-ws-event' as any, handleWsEvent as any);
    return () => window.removeEventListener('altora-ws-event' as any, handleWsEvent as any);
  }, []);

  const handleAdvisorQuerySubmit = async (queryToRun?: string) => {
    const q = queryToRun || searchQuery;
    if (!q.trim() || generating) return;

    setGenerating(true);
    setGenerationStep('AI analysis started...');
    setSaveStatus(null);

    try {
      const newReport = await api.advisor.generatePDFReport(q);
      const reportsList = await api.advisor.getReports();
      setReports(reportsList);
      setActiveReport(newReport);
      setSearchQuery('');
      setViewMode('brief');
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };

  const handleGenerateNewReport = async () => {
    const defaultQuery = profile ? `Strategic growth blueprint for ${profile.industry}` : "General strategic business blueprint";
    handleAdvisorQuerySubmit(defaultQuery);
  };

  const handleSaveToMemory = async () => {
    if (!activeReport) return;
    setSaveStatus('Saving report blueprint to Memory timeline...');
    
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

  const promptSuggestions = [
    "🧁 I want to start a cupcake business",
    "🚀 How can I grow my SaaS startup?",
    "💡 How to price $1,500/mo retainer packages?",
    "🛡️ Risk mitigation strategies for solo operations"
  ];

  const currentPdfUrl = getPdfUrl(activeReport);
  const structuredData = activeReport?.structuredData || {};
  const sections = structuredData.sections || [];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">ALTORA AI STRATEGIC REPORT ENGINE</span>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">Strategic Advisor</h1>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          {activeReport && currentPdfUrl && (
            <a 
              href={currentPdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-charcoal text-ivory text-xs font-semibold rounded hover:bg-gold transition-colors shadow-xs"
            >
              <Download size={14} className="mr-1.5 text-gold" /> Download PDF Document
            </a>
          )}
          <Button 
            variant="primary" 
            onClick={handleGenerateNewReport}
            disabled={generating}
          >
            <Sparkles size={14} className="mr-2" /> 
            {generating ? 'Analyzing Context...' : 'Re-Analyze Strategy'}
          </Button>
        </div>
      </div>

      {/* GEMINI AI ADVISOR SEARCH BAR */}
      <Card className="p-6 border border-gold/30 bg-ivory shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <FileText size={18} className="text-gold" />
          <h3 className="text-sm font-serif font-semibold text-charcoal">Altora AI Advisor Report Generator</h3>
        </div>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAdvisorQuerySubmit(); }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-brown/60" size={16} />
            <input
              type="text"
              placeholder="Ask Advisor any query (e.g. 'I want to start a cupcake business', 'How to grow SaaS')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={generating}
              className="w-full pl-10 pr-4 py-3 bg-cream/40 border border-charcoal/15 focus:border-gold rounded text-xs text-charcoal outline-none placeholder-charcoal/40 font-sans"
            />
          </div>
          <Button 
            type="submit" 
            variant="primary"
            disabled={generating || !searchQuery.trim()}
            className="py-3 px-6"
          >
            {generating ? 'Generating Brief...' : 'Generate Report'} <Sparkles size={14} className="ml-1.5" />
          </Button>
        </form>

        {/* Suggested Prompt Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-1">
          <span className="text-[10px] uppercase font-bold text-brown tracking-wider flex-shrink-0">Sample Queries:</span>
          <div className="flex space-x-2 whitespace-nowrap">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAdvisorQuerySubmit(prompt.replace(/^[^\w]+/, '').trim())}
                className="text-[11px] bg-cream border border-charcoal/10 hover:border-gold text-charcoal px-3 py-1 rounded transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* REAL-TIME GENERATION STATUS OVERLAY */}
      {generating && (
        <Card className="p-8 border border-gold/40 bg-ivory text-center space-y-4 shadow-sm animate-pulse">
          <div className="flex justify-center items-center space-x-2 text-gold">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm font-serif font-semibold text-charcoal">Generating Business Advisor Report...</span>
          </div>
          <p className="text-xs text-brown">{generationStep || 'AI analysis started...'}</p>
          <div className="max-w-md mx-auto bg-cream border border-charcoal/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gold h-full animate-pulse w-3/4"></div>
          </div>
        </Card>
      )}

      {!generating && activeReport && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Historical Reports List */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-2">Advisor Consultations</h4>
            <div className="space-y-2.5">
              {reports.map((rep) => (
                <button
                  key={rep.id}
                  onClick={() => { setActiveReport(rep); setSaveStatus(null); }}
                  className={`w-full text-left p-3.5 border rounded transition-all text-xs focus:outline-none ${activeReport?.id === rep.id ? 'border-gold bg-ivory font-semibold text-charcoal shadow-[inset_0_1px_2px_rgba(26,26,26,0.01)]' : 'border-charcoal/5 bg-ivory/50 text-brown hover:border-charcoal/20'}`}
                >
                  <div className="truncate font-medium flex items-center justify-between">
                    <span className="truncate pr-1">{rep.title}</span>
                    <FileText size={12} className="text-gold flex-shrink-0" />
                  </div>
                  <div className="text-[10px] text-brown/70 mt-1 flex justify-between">
                    <span>{formatDate(rep)}</span>
                    <span className="font-semibold text-gold">Score: {getScore(rep)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Brief Content View & PDF Document View */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Action & Toggle Bar Above Report */}
            <Card className="p-4 border border-charcoal/10 bg-ivory flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              {/* View Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-cream/60 border border-charcoal/10 p-1 rounded">
                <button
                  onClick={() => setViewMode('brief')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${viewMode === 'brief' ? 'bg-ivory text-charcoal shadow-xs border border-charcoal/10' : 'text-brown hover:text-charcoal'}`}
                >
                  Brief On-Screen Content
                </button>
                <button
                  onClick={() => setViewMode('pdf')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center ${viewMode === 'pdf' ? 'bg-ivory text-charcoal shadow-xs border border-charcoal/10' : 'text-brown hover:text-charcoal'}`}
                >
                  <FileText size={12} className="mr-1 text-gold" /> PDF Document View
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={currentPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-ivory border border-charcoal/20 text-charcoal text-xs rounded hover:border-gold hover:text-gold transition-colors"
                >
                  <ExternalLink size={12} className="mr-1" /> Open PDF Tab
                </a>
                <a
                  href={currentPdfUrl}
                  download
                  className="inline-flex items-center px-3 py-1.5 bg-gold text-charcoal text-xs font-semibold rounded hover:bg-gold/90 transition-colors"
                >
                  <Download size={12} className="mr-1" /> Download PDF
                </a>
                <Button variant="outline" size="sm" onClick={handleSaveToMemory}>
                  <Brain size={12} className="mr-1 text-gold" /> Memory
                </Button>
                <Button variant="primary" size="sm" onClick={() => {
                  api.memory.addMemory('Tasks', `Actioned Strategy PDF: ${activeReport.title}`, `Tasks logged from Advisor PDF report.`);
                  setSaveStatus('Actions pushed to Tasks workspace.');
                  setTimeout(() => setSaveStatus(null), 3000);
                }}>
                  <CheckSquare size={12} className="mr-1" /> Deploy Tasks
                </Button>
              </div>
            </Card>

            {saveStatus && (
              <div className="p-3 bg-cream border border-gold/30 rounded text-xs text-brown font-medium">
                {saveStatus}
              </div>
            )}

            {/* MODE 1: BRIEF ON-SCREEN CONTENT VIEW */}
            {viewMode === 'brief' && (
              <div className="space-y-6">
                
                {/* Header Title & Score Card */}
                <Card className="p-8 border border-charcoal/10 bg-ivory space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h2 className="text-xl md:text-2xl font-serif font-semibold text-charcoal mb-1">
                        {activeReport.title}
                      </h2>
                      <span className="text-xs text-brown">{formatDate(activeReport)}</span>
                    </div>
                    
                    {/* Score badge */}
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3 bg-cream border border-gold/30 px-5 py-3 rounded">
                      <div>
                        <span className="text-2xl font-serif font-bold text-charcoal">{getScore(activeReport)}</span>
                        <span className="text-xs text-brown font-medium"> / 100</span>
                      </div>
                      <div className="border-l border-gold/30 h-8 pl-3 flex flex-col justify-center text-[9px] uppercase tracking-wider text-brown font-bold">
                        <span>Viability</span>
                        <span>Score</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-charcoal/5" />

                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-2">Executive Summary & Guidance</h4>
                    <p className="text-sm text-charcoal leading-relaxed font-light font-sans">
                      {activeReport.explanation}
                    </p>
                  </div>
                </Card>

                {/* Structured Sections Rendered on Screen */}
                {sections.length > 0 ? (
                  <div className="space-y-6">
                    {sections.map((sec: any, idx: number) => (
                      <Card key={idx} className="p-6 border border-charcoal/5 bg-ivory space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
                          {sec.title}
                        </h4>

                        {sec.type === 'paragraph' && (
                          <p className="text-xs text-charcoal leading-relaxed font-light">{sec.content}</p>
                        )}

                        {sec.type === 'paragraphs' && (
                          <div className="space-y-2">
                            {sec.content.map((p: string, pidx: number) => (
                              <p key={pidx} className="text-xs text-charcoal leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: p }} />
                            ))}
                          </div>
                        )}

                        {sec.type === 'bullets' && (
                          <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                            {sec.content.map((b: string, bidx: number) => (
                              <li key={bidx} dangerouslySetInnerHTML={{ __html: b }} />
                            ))}
                          </ul>
                        )}

                        {sec.type === 'numbered_list' && (
                          <ol className="list-decimal pl-4 text-xs text-charcoal space-y-1.5">
                            {sec.content.map((item: string, nidx: number) => (
                              <li key={nidx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
                            ))}
                          </ol>
                        )}

                        {sec.type === 'swot' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-4 bg-cream/35 border border-charcoal/5 rounded space-y-2">
                              <h5 className="text-xs font-serif font-bold text-green-800 uppercase tracking-wider">Strengths</h5>
                              <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                                {sec.strengths?.map((s: string, sidx: number) => <li key={sidx}>{s}</li>)}
                              </ul>
                            </div>
                            <div className="p-4 bg-cream/35 border border-charcoal/5 rounded space-y-2">
                              <h5 className="text-xs font-serif font-bold text-red-800 uppercase tracking-wider">Weaknesses</h5>
                              <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                                {sec.weaknesses?.map((w: string, widx: number) => <li key={widx}>{w}</li>)}
                              </ul>
                            </div>
                            <div className="p-4 bg-cream/35 border border-charcoal/5 rounded space-y-2">
                              <h5 className="text-xs font-serif font-bold text-gold uppercase tracking-wider font-semibold">Opportunities</h5>
                              <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                                {sec.opportunities?.map((o: string, oidx: number) => <li key={oidx}>{o}</li>)}
                              </ul>
                            </div>
                            <div className="p-4 bg-cream/35 border border-charcoal/5 rounded space-y-2">
                              <h5 className="text-xs font-serif font-bold text-brown uppercase tracking-wider">Threats</h5>
                              <ul className="list-disc pl-4 text-xs text-charcoal space-y-1">
                                {sec.threats?.map((t: string, tidx: number) => <li key={tidx}>{t}</li>)}
                              </ul>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Fallback Executive Cards if legacy report format */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 border border-charcoal/5 bg-ivory space-y-3">
                        <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">Market & Target Audience</h4>
                        <p className="text-xs text-charcoal">{activeReport.targetCustomer}</p>
                        <p className="text-xs text-brown">{activeReport.marketOpportunity}</p>
                      </Card>
                      <Card className="p-6 border border-charcoal/5 bg-ivory space-y-3">
                        <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">Business & Pricing Model</h4>
                        <p className="text-xs text-charcoal">{activeReport.revenueModel}</p>
                        <p className="text-xs text-brown">{activeReport.pricing}</p>
                      </Card>
                    </div>

                    {activeReport.swot && (
                      <Card className="p-6 border border-charcoal/5 bg-ivory space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">SWOT Analysis</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-cream/35 border border-charcoal/5 rounded">
                            <h5 className="text-xs font-serif font-bold text-green-800 uppercase">Strengths</h5>
                            <ul className="list-disc pl-4 text-xs text-charcoal mt-1">
                              {activeReport.swot.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                          <div className="p-3 bg-cream/35 border border-charcoal/5 rounded">
                            <h5 className="text-xs font-serif font-bold text-red-800 uppercase">Weaknesses</h5>
                            <ul className="list-disc pl-4 text-xs text-charcoal mt-1">
                              {activeReport.swot.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                            </ul>
                          </div>
                          <div className="p-3 bg-cream/35 border border-charcoal/5 rounded">
                            <h5 className="text-xs font-serif font-bold text-gold uppercase">Opportunities</h5>
                            <ul className="list-disc pl-4 text-xs text-charcoal mt-1">
                              {activeReport.swot.opportunities?.map((o, idx) => <li key={idx}>{o}</li>)}
                            </ul>
                          </div>
                          <div className="p-3 bg-cream/35 border border-charcoal/5 rounded">
                            <h5 className="text-xs font-serif font-bold text-brown uppercase">Threats</h5>
                            <ul className="list-disc pl-4 text-xs text-charcoal mt-1">
                              {activeReport.swot.threats?.map((t, idx) => <li key={idx}>{t}</li>)}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* MODE 2: PDF DOCUMENT VIEW */}
            {viewMode === 'pdf' && (
              <Card className="p-2 border border-charcoal/15 bg-ivory shadow-sm overflow-hidden">
                <div className="w-full bg-cream/30 border-b border-charcoal/10 px-4 py-2 flex justify-between items-center text-[11px] text-brown font-mono">
                  <span>REAL VECTOR PDF DOCUMENT — Selectable & Searchable</span>
                  <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center text-gold font-sans font-semibold">
                    <ExternalLink size={12} className="mr-1" /> Open in New Window
                  </a>
                </div>
                <iframe
                  key={activeReport.id}
                  src={`${currentPdfUrl}#toolbar=1&navpanes=0&view=FitH`}
                  title={`Altora AI Advisor Report - ${activeReport.title}`}
                  className="w-full h-[750px] border-0 rounded-b bg-white"
                />
              </Card>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
