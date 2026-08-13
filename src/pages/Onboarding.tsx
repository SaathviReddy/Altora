import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  ArrowRight, 
  ArrowLeft,
  Compass, 
  Sparkles, 
  Layers, 
  Activity,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Building
} from 'lucide-react';
import { api, BusinessProfile } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Founder');

  // Step state
  // 1: Stage selection
  // 2: Questionnaire steps (progressive)
  // 3: Strategy Report Preview before dashboard entry
  const [step, setStep] = useState(1);
  const [selectedStage, setSelectedStage] = useState<'no_idea' | 'idea' | 'business' | null>(null);
  
  // Progressive Questionnaire Step within the selected stage
  const [subStep, setSubStep] = useState(1);

  // Form States
  const [answers, setAnswers] = useState<Partial<BusinessProfile>>({
    industry: '',
    interests: [],
    skills: [],
    budget: '',
    location: '',
    availableTime: '',
    onlinePreference: 'online',
    soloPreference: 'solo',
    investmentCapacity: 0,
    currentChallenges: [],
    goals: [],
    revenue: 0,
    expenses: 0,
    details: ''
  });

  // Target values for Idea flow
  const [ideaName, setIdeaName] = useState('');
  const [ideaSummary, setIdeaSummary] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [pricingModel, setPricingModel] = useState('');

  useEffect(() => {
    api.auth.getMe().then((user) => {
      if (!user) {
        navigate('/login');
      } else {
        setUserName(user.name);
      }
    });
  }, [navigate]);

  const selectStage = (stage: 'no_idea' | 'idea' | 'business') => {
    setSelectedStage(stage);
    setAnswers(prev => ({ ...prev, stage }));
    setStep(2);
    setSubStep(1);
  };

  const handleCheckboxChange = (field: 'interests' | 'skills' | 'currentChallenges' | 'goals', value: string) => {
    const list = (answers[field] as string[]) || [];
    if (list.includes(value)) {
      setAnswers({ ...answers, [field]: list.filter(item => item !== value) });
    } else {
      setAnswers({ ...answers, [field]: [...list, value] });
    }
  };

  const handleNextSubStep = () => {
    // Stage-specific navigation length
    const maxSubSteps = selectedStage === 'no_idea' ? 3 : selectedStage === 'idea' ? 2 : 2;
    if (subStep < maxSubSteps) {
      setSubStep(subStep + 1);
    } else {
      // Finished form, generate summary pre-view page
      setStep(3);
    }
  };

  const handlePrevSubStep = () => {
    if (subStep > 1) {
      setSubStep(subStep - 1);
    } else {
      setStep(1);
    }
  };

  const handleCompleteOnboarding = async () => {
    // Structure final profile save
    const finalProfile: BusinessProfile = {
      stage: selectedStage!,
      industry: answers.industry || (selectedStage === 'no_idea' ? 'Advisory Services' : 'Tech Venture'),
      interests: answers.interests,
      skills: answers.skills,
      budget: answers.budget,
      location: answers.location,
      availableTime: answers.availableTime,
      onlinePreference: answers.onlinePreference,
      soloPreference: answers.soloPreference,
      investmentCapacity: answers.investmentCapacity || 0,
      currentChallenges: answers.currentChallenges,
      goals: answers.goals || [selectedStage === 'no_idea' ? 'Discover my first market validation niche' : 'Secure initial strategy retainers'],
      revenue: answers.revenue || 0,
      expenses: answers.expenses || 0,
      details: answers.details || ideaSummary || 'Strategic digital business startup setup.'
    };

    // Update user business name
    const user = await api.auth.getMe();
    if (user) {
      user.businessName = ideaName || answers.industry || (selectedStage === 'no_idea' ? 'My Venture' : 'Altora Ventures');
    }

    await api.business.saveOnboarding(finalProfile);
    navigate('/app/workspace');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between py-12 px-6 font-sans">
      
      {/* Header bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Briefcase size={20} className="text-gold" />
          <span className="font-serif font-semibold text-charcoal tracking-widest">ALTORA</span>
        </div>
        <div className="text-xs uppercase tracking-wider text-brown font-semibold bg-ivory px-3 py-1 border border-charcoal/5 rounded">
          Consultation Mode
        </div>
      </div>

      {/* Main Multi-step Canvas */}
      <div className="max-w-4xl w-full mx-auto my-auto py-10">
        
        {/* STEP 1: JOURNEY STAGE SELECTOR */}
        {step === 1 && (
          <div className="space-y-10 animate-fade-in text-center">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-serif font-medium text-charcoal">
                Hello, {userName}.
              </h1>
              <p className="text-sm md:text-base text-brown font-light max-w-xl mx-auto">
                Altora works by centering AI guidance around your business's active context. To deploy your workspace, select the prompt representing your current stage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* 🌱 No Idea card */}
              <button 
                onClick={() => selectStage('no_idea')}
                className="group text-left border border-charcoal/10 bg-ivory hover:border-gold/50 p-8 rounded shadow-[0_2px_8px_rgba(26,26,26,0.01)] hover:-translate-y-1 transition-all duration-200 focus:outline-none"
              >
                <Compass size={28} className="text-brown group-hover:text-gold transition-colors mb-6" />
                <h3 className="text-lg font-serif font-semibold text-charcoal mb-2">🌱 No Idea</h3>
                <p className="text-xs text-brown leading-relaxed font-light">
                  "I want to discover the right business for me. Help me analyze my skills, budget parameters, and locate target niches."
                </p>
                <div className="mt-6 flex items-center text-xs uppercase tracking-wider text-brown group-hover:text-gold font-semibold transition-colors">
                  Consult discovery <ArrowRight size={14} className="ml-1.5" />
                </div>
              </button>

              {/* 💡 I Have an Idea card */}
              <button 
                onClick={() => selectStage('idea')}
                className="group text-left border border-charcoal/10 bg-ivory hover:border-gold/50 p-8 rounded shadow-[0_2px_8px_rgba(26,26,26,0.01)] hover:-translate-y-1 transition-all duration-200 focus:outline-none"
              >
                <Lightbulb size={28} className="text-brown group-hover:text-gold transition-colors mb-6" />
                <h3 className="text-lg font-serif font-semibold text-charcoal mb-2">💡 I Have an Idea</h3>
                <p className="text-xs text-brown leading-relaxed font-light">
                  "I have an idea and want to validate it. Perform client profiling, SWOT mapping, pricing model analysis, and roadmap steps."
                </p>
                <div className="mt-6 flex items-center text-xs uppercase tracking-wider text-brown group-hover:text-gold font-semibold transition-colors">
                  Consult validation <ArrowRight size={14} className="ml-1.5" />
                </div>
              </button>

              {/* 🚀 I Have a Business card */}
              <button 
                onClick={() => selectStage('business')}
                className="group text-left border border-charcoal/10 bg-ivory hover:border-gold/50 p-8 rounded shadow-[0_2px_8px_rgba(26,26,26,0.01)] hover:-translate-y-1 transition-all duration-200 focus:outline-none"
              >
                <Building size={28} className="text-brown group-hover:text-gold transition-colors mb-6" />
                <h3 className="text-lg font-serif font-semibold text-charcoal mb-2">🚀 I Have a Business</h3>
                <p className="text-xs text-brown leading-relaxed font-light">
                  "I am running a business and want to scale. Deploy my finance tracker, inventory catalog, milestone timeline, and advisor logs."
                </p>
                <div className="mt-6 flex items-center text-xs uppercase tracking-wider text-brown group-hover:text-gold font-semibold transition-colors">
                  Deploy operations <ArrowRight size={14} className="ml-1.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STAGE-SPECIFIC PROGRESSIVE QUESTIONNAIRE */}
        {step === 2 && (
          <div className="max-w-xl mx-auto space-y-8 animate-fade-in text-left">
            {/* Navigation back and sub-step tracker */}
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-brown">
              <button onClick={handlePrevSubStep} className="flex items-center hover:text-charcoal transition-colors focus:outline-none py-1">
                <ArrowLeft size={14} className="mr-1.5" /> Back
              </button>
              <span className="font-semibold">
                Questionnaire {subStep} / {selectedStage === 'no_idea' ? 3 : 2}
              </span>
            </div>

            <Card className="p-8 border border-charcoal/10 bg-ivory space-y-6">
              
              {/* FLOW A: NO IDEA (3 substeps) */}
              {selectedStage === 'no_idea' && (
                <>
                  {subStep === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="text-xl font-serif font-medium text-charcoal">Skills & Interest Map</h3>
                      <p className="text-xs text-brown font-light leading-relaxed">
                        Select the strategy vectors you enjoy. Altora references these to build business niches.
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-brown">Interests / Domains</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Technology', 'Creative Design', 'Education', 'Wellness', 'Writing/Content', 'Commerce'].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleCheckboxChange('interests', val)}
                              className={`text-xs p-3 border rounded text-left transition-colors ${answers.interests?.includes(val) ? 'border-gold bg-gold/5 font-semibold text-charcoal' : 'border-charcoal/10 hover:border-charcoal/30 text-brown'}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {subStep === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="text-xl font-serif font-medium text-charcoal">Budget & Capacity Limits</h3>
                      <p className="text-xs text-brown font-light leading-relaxed">
                        Specify structural limits to filter high capital models from service agency models.
                      </p>
                      
                      <div className="space-y-4 pt-2">
                        <Input
                          label="Investment Capacity ($ USD)"
                          type="number"
                          placeholder="e.g. 5000"
                          value={answers.investmentCapacity || ''}
                          onChange={(e) => setAnswers({ ...answers, investmentCapacity: Number(e.target.value) })}
                        />
                        <Input
                          label="Available Hours per Week"
                          type="text"
                          placeholder="e.g. 20 hours"
                          value={answers.availableTime || ''}
                          onChange={(e) => setAnswers({ ...answers, availableTime: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {subStep === 3 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="text-xl font-serif font-medium text-charcoal">Structure Preferences</h3>
                      <p className="text-xs text-brown font-light leading-relaxed">
                        Set working parameters. Altora filters online dropshipping from boutique physical agency models.
                      </p>
                      
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="block text-xs uppercase tracking-wider font-semibold text-brown">Location Channel</label>
                          <select
                            value={answers.onlinePreference}
                            onChange={(e: any) => setAnswers({ ...answers, onlinePreference: e.target.value })}
                            className="w-full bg-ivory border border-charcoal/20 focus:border-gold rounded px-4 py-2.5 text-sm text-charcoal outline-none font-sans"
                          >
                            <option value="online">Fully Online (Remote/SaaS/Service)</option>
                            <option value="offline">Brick & Mortar / Physical</option>
                            <option value="hybrid">Hybrid (Local consulting + online delivery)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs uppercase tracking-wider font-semibold text-brown">Team Paradigm</label>
                          <select
                            value={answers.soloPreference}
                            onChange={(e: any) => setAnswers({ ...answers, soloPreference: e.target.value })}
                            className="w-full bg-ivory border border-charcoal/20 focus:border-gold rounded px-4 py-2.5 text-sm text-charcoal outline-none font-sans"
                          >
                            <option value="solo">Solopreneur / Individual contractor</option>
                            <option value="team">Partnership / Co-founders</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* FLOW B: HAVE AN IDEA (2 substeps) */}
              {selectedStage === 'idea' && (
                <>
                  {subStep === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="text-xl font-serif font-medium text-charcoal">Idea Description</h3>
                      <p className="text-xs text-brown font-light leading-relaxed">
                        Share your startup hypothesis. The advisor will organize a full SWOT framework.
                      </p>

                      <div className="space-y-4 pt-2">
                        <Input
                          label="Project/Venture Name"
                          type="text"
                          placeholder="e.g. Verdant Craft"
                          value={ideaName}
                          onChange={(e) => setIdeaName(e.target.value)}
                        />
                        <div className="space-y-1.5">
                          <label className="block text-xs uppercase tracking-wider font-semibold text-brown">Venture Hypothesis Summary</label>
                          <textarea
                            rows={3}
                            placeholder="What customer problem does your idea address and how?"
                            value={ideaSummary}
                            onChange={(e) => setIdeaSummary(e.target.value)}
                            className="w-full bg-ivory border border-charcoal/20 focus:border-gold rounded p-4 text-sm text-charcoal outline-none font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {subStep === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="text-xl font-serif font-medium text-charcoal">Niche & Customer Mapping</h3>
                      <p className="text-xs text-brown font-light leading-relaxed">
                        Outline target customers. Altora evaluates competitor barriers and pricing metrics.
                      </p>

                      <div className="space-y-4 pt-2">
                        <Input
                          label="Target Customer Profile"
                          type="text"
                          placeholder="e.g. Boutique hotel owners seeking sustainable coffee"
                          value={targetCustomer}
                          onChange={(e) => setTargetCustomer(e.target.value)}
                        />
                        <Input
                          label="Hypothetical Pricing ($ retainer or unit price)"
                          type="text"
                          placeholder="e.g. $1,500/month retainer"
                          value={pricingModel}
                          onChange={(e) => setPricingModel(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* FLOW C: HAVE A BUSINESS (2 substeps) */}
              {selectedStage === 'business' && (
                <>
                  {subStep === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="text-xl font-serif font-medium text-charcoal">Business Operations Context</h3>
                      <p className="text-xs text-brown font-light leading-relaxed">
                        Identify your active sector to configure your inventory and milestones track.
                      </p>

                      <div className="space-y-4 pt-2">
                        <Input
                          label="Venture Legal/Trading Name"
                          type="text"
                          placeholder="e.g. Altora Strategy Group"
                          value={ideaName}
                          onChange={(e) => setIdeaName(e.target.value)}
                        />
                        <Input
                          label="Active Industry / Field"
                          type="text"
                          placeholder="e.g. Brand Consulting, E-Commerce, Software"
                          value={answers.industry || ''}
                          onChange={(e) => setAnswers({ ...answers, industry: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {subStep === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="text-xl font-serif font-medium text-charcoal">Financial Snapshot</h3>
                      <p className="text-xs text-brown font-light leading-relaxed">
                        Altora initializes your balance sheet trend. Enter approximate numbers.
                      </p>

                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Initial Capital Investment"
                            type="number"
                            placeholder="e.g. 25000"
                            value={answers.investmentCapacity || ''}
                            onChange={(e) => setAnswers({ ...answers, investmentCapacity: Number(e.target.value) })}
                          />
                          <Input
                            label="Active Monthly Revenue"
                            type="number"
                            placeholder="e.g. 4800"
                            value={answers.revenue || ''}
                            onChange={(e) => setAnswers({ ...answers, revenue: Number(e.target.value) })}
                          />
                        </div>
                        <Input
                          label="Active Monthly Operating Expenses"
                          type="number"
                          placeholder="e.g. 1850"
                          value={answers.expenses || ''}
                          onChange={(e) => setAnswers({ ...answers, expenses: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Proceed Action Button */}
              <Button
                onClick={handleNextSubStep}
                variant="primary"
                className="w-full py-3"
              >
                Proceed Setup <ArrowRight className="ml-2" size={16} />
              </Button>
            </Card>
          </div>
        )}

        {/* STEP 3: HIGH-FIDELITY CONSULTATION PREVIEW */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in text-left max-w-2xl mx-auto">
            <div className="text-center space-y-3 mb-8">
              <CheckCircle size={40} className="text-gold mx-auto" />
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-charcoal">Venture Assessment Ready</h2>
              <p className="text-sm text-brown max-w-md mx-auto">
                Altora has configured your business brain. Review your strategy overview before launching your command center.
              </p>
            </div>

            <Card className="p-8 border border-charcoal/10 bg-ivory space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-2">Stage Blueprint</h4>
                <p className="text-lg font-serif font-medium text-charcoal capitalize">
                  {selectedStage === 'no_idea' ? '🌱 Business Discovery Niche' : selectedStage === 'idea' ? '💡 Verified Niche Strategy' : '🚀 Established Growth Roadmap'}
                </p>
              </div>

              <hr className="border-charcoal/5" />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-1">Target Sector</h4>
                  <p className="text-sm text-charcoal">{answers.industry || 'B2B Strategy & Consulting'}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-1">Working Budget Context</h4>
                  <p className="text-sm text-charcoal">
                    ${answers.investmentCapacity?.toLocaleString() || '25,000'} startup capital
                  </p>
                </div>
              </div>

              <hr className="border-charcoal/5" />

              <div>
                <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-2">Key Launch Tasks Formulated</h4>
                <ul className="space-y-2 text-xs text-charcoal">
                  <li className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                    <span>Deploy target client survey forms to validate hypothesis</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                    <span>Set initial milestones mapping in your timeline tracker</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                    <span>Log capital and retainer deposits inside local cash balance</span>
                  </li>
                </ul>
              </div>

              <hr className="border-charcoal/5" />

              <Button
                onClick={handleCompleteOnboarding}
                variant="primary"
                className="w-full py-3.5"
              >
                Deploy Command Center <ArrowRight className="ml-2.5" size={16} />
              </Button>
            </Card>
          </div>
        )}

      </div>

      {/* Footer copyright */}
      <div className="max-w-4xl w-full mx-auto text-center text-xs text-brown">
        <span>Altora OS guides you from validation to operational scale.</span>
      </div>

    </div>
  );
};
