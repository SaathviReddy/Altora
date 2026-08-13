import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  CheckSquare, 
  Sparkles, 
  Brain, 
  Milestone, 
  ArrowRight,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { api, BusinessProfile, Milestone as MilestoneType, Task, Memory } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const Workspace: React.FC = () => {
  const navigate = useNavigate();
  
  // Data States
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [financeSummary, setFinanceSummary] = useState<{ investment: number; revenue: number; expenses: number; profit: number } | null>(null);
  const [milestones, setMilestones] = useState<MilestoneType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const activeProfile = await api.business.getProfile();
      if (!activeProfile) {
        navigate('/onboarding');
        return;
      }
      setProfile(activeProfile);

      const fin = await api.finance.getSummary();
      setFinanceSummary(fin);

      const ms = await api.milestones.getMilestones();
      setMilestones(ms.slice(0, 3)); // show top 3 recent milestones

      const t = await api.tasks.getTasks();
      setTasks(t.slice(0, 4)); // show top 4 priorities

      const mem = await api.memory.getMemories();
      setMemories(mem.slice(0, 3)); // show top 3 memories
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const handleToggleTask = async (id: string) => {
    await api.tasks.toggleTask(id);
    loadData(); // reload
  };

  if (loading) {
    return <Skeleton message="Reviewing your business context..." />;
  }

  // Calculate some health metrics
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const completedMilestonesCount = milestones.filter(m => m.completed).length;
  const totalMilestonesCount = milestones.length;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-gold font-bold">OPERATING SYSTEM</span>
        <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">Founder Command Center</h1>
      </div>

      {/* Grid Layout (Hierarchy: Large Left, Secondary Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Double-Column Block */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Business Health Card */}
          <Card className="p-8 border border-charcoal/10 bg-ivory space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-1">Venture Sector</h4>
                <p className="text-xl font-serif font-medium text-charcoal">{profile?.industry || 'B2B Consulting Services'}</p>
              </div>
              <span className="mt-2 sm:mt-0 text-xs px-3 py-1 bg-green-50 text-green-800 font-semibold border border-green-200/50 rounded uppercase tracking-wider">
                Operational Stability: Healthy
              </span>
            </div>

            <hr className="border-charcoal/5" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-3">Goal Alignment</h4>
                <div className="space-y-2">
                  {profile?.goals && profile.goals.length > 0 ? (
                    profile.goals.map((goal, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-charcoal">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0"></span>
                        <span>{goal}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-brown italic">No active objectives saved yet.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-3">Milestone Progress</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brown">Timeline Stages</span>
                    <span className="font-semibold text-charcoal">{completedMilestonesCount} / {totalMilestonesCount} Done</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-cream rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold transition-all duration-300"
                      style={{ width: `${totalMilestonesCount > 0 ? (completedMilestonesCount / totalMilestonesCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 border border-charcoal/5 bg-ivory">
              <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Total Revenue</span>
              <p className="text-2xl font-serif font-semibold text-charcoal mt-1">
                ${financeSummary?.revenue.toLocaleString() || '0'}
              </p>
              <div className="mt-4 flex items-center text-[10px] text-green-700 font-semibold">
                <TrendingUp size={12} className="mr-1" /> Healthy operational receipts
              </div>
            </Card>

            <Card className="p-6 border border-charcoal/5 bg-ivory">
              <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Operating Costs</span>
              <p className="text-2xl font-serif font-semibold text-charcoal/80 mt-1">
                ${financeSummary?.expenses.toLocaleString() || '0'}
              </p>
              <div className="mt-4 flex items-center text-[10px] text-brown font-semibold">
                <TrendingDown size={12} className="mr-1" /> Muted infrastructure burn
              </div>
            </Card>

            <Card className="p-6 border border-charcoal/5 bg-ivory">
              <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Profit (Net)</span>
              <p className={`text-2xl font-serif font-semibold mt-1 ${financeSummary && financeSummary.profit >= 0 ? 'text-charcoal' : 'text-red-700'}`}>
                ${financeSummary?.profit.toLocaleString() || '0'}
              </p>
              <div className="mt-4 flex items-center text-[10px] text-gold font-bold">
                <DollarSign size={12} className="mr-0.5" /> Margin: {financeSummary && financeSummary.revenue > 0 ? Math.round((financeSummary.profit / financeSummary.revenue) * 100) : 0}%
              </div>
            </Card>
          </div>

          {/* Recent Memories & Decisions */}
          <Card className="p-8 border border-charcoal/10 bg-ivory space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs uppercase tracking-widest text-brown font-semibold">Recent Memories</h4>
              <Link to="/app/memory" className="text-xs text-gold uppercase tracking-wider font-bold flex items-center hover:underline">
                View all <ArrowRight size={12} className="ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {memories.length > 0 ? (
                memories.map((m) => (
                  <div key={m.id} className="border-l-2 border-gold/40 pl-4 py-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-serif font-semibold text-charcoal">{m.title}</h5>
                      <span className="text-[10px] text-brown">{new Date(m.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-brown line-clamp-2 leading-relaxed">{m.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brown italic">Your milestone decisions will appear here.</p>
              )}
            </div>
          </Card>

        </div>

        {/* Right Single-Column Sidebar */}
        <div className="space-y-8">
          
          {/* Priority AI Recommendation */}
          <Card className="p-6 border border-gold/30 bg-ivory space-y-4 shadow-[0_4px_16px_rgba(201,169,97,0.04)] relative overflow-hidden">
            {/* Elegant Accent Dot */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-8 -mt-8"></div>
            
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-gold" />
              <span className="text-[10px] uppercase tracking-wider text-gold font-bold">AI Operational Anchor</span>
            </div>
            
            <p className="text-xs text-charcoal font-medium leading-relaxed">
              "You have $25,000 in equity reserve capital. Based on your target retention goal of $3,500, allocate your upcoming work cycle strictly on validation client contracts."
            </p>

            <div className="pt-2">
              <Button variant="primary" size="sm" className="w-full" onClick={() => navigate('/app/advisor')}>
                Open Strategic Advisor
              </Button>
            </div>
          </Card>

          {/* Today's Priorities list */}
          <Card className="p-6 border border-charcoal/10 bg-ivory space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-brown font-semibold mb-2">Active Priorities</h4>
            
            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 text-xs">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="mt-0.5 border-charcoal/30 text-gold rounded focus:ring-gold accent-gold cursor-pointer"
                    />
                    <span className={`text-charcoal ${task.completed ? 'line-through text-brown/70' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brown italic">All priority items completed.</p>
              )}
            </div>

            <div className="border-t border-charcoal/5 pt-4 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brown">Priority Progress</span>
                <span className="font-semibold text-charcoal">
                  {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% Complete
                </span>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
