import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  Brain, 
  Target, 
  TrendingUp, 
  Compass, 
  DollarSign, 
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [demoActive, setDemoActive] = useState(false);

  return (
    <div className="min-h-screen bg-cream text-charcoal font-sans selection:bg-gold/20 flex flex-col justify-between">
      
      {/* Editorial Navbar */}
      <nav className="max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center z-10 border-b border-charcoal/5">
        <div className="flex items-center space-x-2.5">
          <Briefcase size={22} className="text-gold" />
          <span className="font-serif font-semibold text-xl tracking-widest text-charcoal">ALTORA</span>
        </div>
        
        {/* Navigation links */}
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-wider text-brown font-medium">
          <a href="#features" className="hover:text-charcoal transition-colors">Features</a>
          <a href="#workflow" className="hover:text-charcoal transition-colors">Workflow</a>
          <a href="#about" className="hover:text-charcoal transition-colors">About</a>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm uppercase tracking-wider font-semibold text-brown hover:text-charcoal transition-colors">
            Sign In
          </Link>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-16 md:pt-24 pb-16 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-serif max-w-4xl leading-[1.1] tracking-tight font-medium">
          Build companies that <span className="italic text-gold">deserve to exist</span>.
        </h1>
        <p className="mt-6 text-base md:text-lg text-brown max-w-2xl font-light font-sans tracking-wide leading-relaxed">
          Your AI operating system for founders — from idea to scale and beyond. Altora integrates context memory with tactical templates to design, launch, and operate your business.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/signup')}>
            Start Your Journey <ArrowRight className="ml-2.5" size={16} />
          </Button>
          <Button variant="outline" size="lg" onClick={() => setDemoActive(true)}>
            Watch Demo <Play className="ml-2.5 text-gold fill-gold/10" size={16} />
          </Button>
        </div>

        {/* Demo Video Modal Mockup */}
        {demoActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/35 backdrop-blur-xs" onClick={() => setDemoActive(false)}>
            <div className="bg-ivory border border-charcoal/10 max-w-lg p-8 rounded text-left shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-serif font-semibold text-charcoal mb-4">Altora Core Platform Demo</h3>
              <p className="text-sm text-brown leading-relaxed mb-6">
                Altora works by establishing a **persistent business memory database**. As you progress from initial stage validations into daily operations and sales tracking, the AI advisor references your exact historical balance sheet, target audience interviews, and milestone schedule to deliver custom-tailored recommendations.
              </p>
              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setDemoActive(false)}>Close Overview</Button>
              </div>
            </div>
          </div>
        )}

        {/* Product Visual Mockup */}
        <div className="mt-16 w-full max-w-5xl border border-charcoal/10 rounded-lg p-2.5 bg-ivory shadow-[0_12px_40px_rgba(26,26,26,0.04)] animate-fade-in">
          <div className="bg-cream/40 border border-charcoal/5 rounded-md overflow-hidden text-left p-6 md:p-8 font-sans">
            {/* Visual Header */}
            <div className="flex justify-between items-center border-b border-charcoal/5 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                <span className="text-xs font-serif italic text-brown pl-2">Altora Founder Dashboard — Verdant Craft Ltd.</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-gold font-semibold bg-gold/10 px-2 py-0.5 rounded">CONNECTED</span>
            </div>

            {/* Simulated UI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Health & Recommendation */}
                <div className="bg-ivory border border-charcoal/5 p-5 rounded space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-brown">AI Strategic Recommendation</h4>
                  <p className="text-sm font-medium text-charcoal">
                    "Verdant Craft's second milestone is 82% validated. Target clients index high on sustainability retainers. Action: Push the proposal template to client CRM and log initial invoice of $3,500."
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <span className="text-xs px-2.5 py-1 bg-cream border border-gold/30 rounded text-gold font-semibold">Save to Memory</span>
                    <span className="text-xs px-2.5 py-1 bg-charcoal text-cream rounded hover:bg-opacity-95 cursor-pointer">Open advisor</span>
                  </div>
                </div>

                {/* Milestones bar */}
                <div className="bg-ivory border border-charcoal/5 p-5 rounded space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-brown">Milestone Timeline</h4>
                  <div className="flex items-center justify-between text-xs pt-1.5">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-[10px] text-cream font-bold">✓</div>
                      <span className="mt-1 font-semibold text-charcoal">Validation</span>
                    </div>
                    <div className="h-0.5 flex-1 bg-gold mx-2"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-[10px] text-cream font-bold">✓</div>
                      <span className="mt-1 font-semibold text-charcoal">Alpha Client</span>
                    </div>
                    <div className="h-0.5 flex-1 bg-charcoal/10 mx-2"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full border border-charcoal/20 flex items-center justify-center text-[10px] text-brown">3</div>
                      <span className="mt-1 text-brown">Public Launch</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Snapshot Side Card */}
              <div className="bg-ivory border border-charcoal/5 p-5 rounded flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-brown mb-4">Financial Health</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-serif text-charcoal font-semibold">$28,600</p>
                      <p className="text-[10px] text-brown uppercase tracking-wider">Total Revenue</p>
                    </div>
                    <div>
                      <p className="text-lg font-serif text-charcoal/80">$4,300</p>
                      <p className="text-[10px] text-brown uppercase tracking-wider">Operating Expenses</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-charcoal/5 pt-4 mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brown">Profit/Loss (Net)</span>
                    <span className="text-green-700 font-bold">+$24,300</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section id="features" className="max-w-6xl w-full mx-auto px-6 py-20 border-t border-charcoal/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">Designed for execution</p>
          <h2 className="text-3xl md:text-4xl font-serif font-medium">An elegant partner for business architecture.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverEffect>
            <Brain className="text-gold mb-4" size={28} />
            <h3 className="text-lg font-serif font-medium text-charcoal mb-2">Persistent AI Memory</h3>
            <p className="text-sm text-brown leading-relaxed font-light">
              Altora stores and parses strategic decisions, task changes, customer feedback, and financial transactions. The AI acts on your active context, eliminating generic advice prompts.
            </p>
          </Card>

          <Card hoverEffect>
            <Compass className="text-gold mb-4" size={28} />
            <h3 className="text-lg font-serif font-medium text-charcoal mb-2">Strategic Guidance</h3>
            <p className="text-sm text-brown leading-relaxed font-light">
              Interactive SWOT matrix mappings, target pricing estimations, risk mitigations, and sequential launching timelines grounded in real-world feasibility.
            </p>
          </Card>

          <Card hoverEffect>
            <TrendingUp className="text-gold mb-4" size={28} />
            <h3 className="text-lg font-serif font-medium text-charcoal mb-2">Operations & Cashflow</h3>
            <p className="text-sm text-brown leading-relaxed font-light">
              Easily track investments, catalog items, sales, and expenses. View real-time cash ledger metrics and export generated reports to coordinate with external stakeholders.
            </p>
          </Card>
        </div>
      </section>

      {/* Founder Journey Workflow */}
      <section id="workflow" className="max-w-6xl w-full mx-auto px-6 py-20 border-t border-charcoal/5 bg-ivory/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">Journey framework</p>
            <h2 className="text-3xl md:text-4xl font-serif font-medium leading-snug">
              Every phase of builder growth, automated in one timeline.
            </h2>
            <p className="mt-4 text-sm md:text-base text-brown font-light leading-relaxed">
              We guide you from no idea, through strategy selection, market verification surveys, operations blueprints, and financial ledger management. You build, Altora remembers and validates.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="text-gold flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">No Idea Consultation</h4>
                  <p className="text-xs text-brown font-light">Map interests, location parameters, and investment capacity to target sectors.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheck className="text-gold flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Idea Verification & SWOT</h4>
                  <p className="text-xs text-brown font-light">Conduct deep analysis of target clients, pricing metrics, and competitor maps.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheck className="text-gold flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Operations Hub</h4>
                  <p className="text-xs text-brown font-light">Log transaction sheets, products inventory, and roadmap milestones.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Graphical Journey Flow */}
          <div className="border border-charcoal/5 bg-ivory p-6 rounded space-y-6">
            <div className="flex items-center space-x-4 border-l-2 border-gold/30 pl-4 py-2">
              <span className="text-xs font-serif italic text-gold font-semibold">01</span>
              <div>
                <h4 className="text-sm font-serif font-semibold text-charcoal">Strategic Consultation</h4>
                <p className="text-xs text-brown font-light">Skills, budget, and time criteria parsed.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 border-l-2 border-gold pl-4 py-2 bg-cream/35">
              <span className="text-xs font-serif italic text-gold font-semibold">02</span>
              <div>
                <h4 className="text-sm font-serif font-semibold text-charcoal">Validated Business Plan</h4>
                <p className="text-xs text-brown font-light">Advisor generates custom SWOT and milestones.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 border-l-2 border-gold/30 pl-4 py-2">
              <span className="text-xs font-serif italic text-gold font-semibold">03</span>
              <div>
                <h4 className="text-sm font-serif font-semibold text-charcoal">Financial & Catalog Operations</h4>
                <p className="text-xs text-brown font-light">Live transaction inputs automatically sync to advisor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Final CTA */}
      <section className="max-w-6xl w-full mx-auto px-6 py-20 text-center border-t border-charcoal/5">
        <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">Build with clarity</p>
        <h2 className="text-3xl md:text-5xl font-serif max-w-2xl mx-auto leading-tight font-medium">
          Ready to scale your business blueprint?
        </h2>
        <p className="mt-4 text-sm text-brown max-w-md mx-auto font-light">
          Create a free account, complete the founder consultation, and access your strategy dashboard immediately.
        </p>
        <div className="mt-8">
          <Button variant="primary" size="lg" onClick={() => navigate('/signup')}>
            Start Your Journey <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer id="about" className="max-w-6xl w-full mx-auto px-6 py-12 border-t border-charcoal/10 flex flex-col md:flex-row justify-between items-center text-xs text-brown">
        <div className="flex items-center space-x-2.5 mb-6 md:mb-0">
          <Briefcase size={16} className="text-gold" />
          <span className="font-serif font-semibold text-charcoal tracking-widest">ALTORA</span>
        </div>
        <div className="flex space-x-8 mb-6 md:mb-0">
          <Link to="/login" className="hover:text-charcoal transition-colors">Product</Link>
          <a href="#features" className="hover:text-charcoal transition-colors">Features</a>
          <a href="#workflow" className="hover:text-charcoal transition-colors">Workflow</a>
          <Link to="/signup" className="hover:text-charcoal transition-colors">Register</Link>
        </div>
        <div>
          <span>© {new Date().getFullYear()} Altora Inc. Your business operating partner.</span>
        </div>
      </footer>

    </div>
  );
};
