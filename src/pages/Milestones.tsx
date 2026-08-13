import React, { useState, useEffect } from 'react';
import { Milestone, Plus, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { api, Milestone as MilestoneType } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';

export const Milestones: React.FC = () => {
  const [milestones, setMilestones] = useState<MilestoneType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Add milestone form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const loadMilestones = async () => {
    try {
      const data = await api.milestones.getMilestones();
      setMilestones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date) return;

    try {
      await api.milestones.addMilestone(title, description, date);
      setTitle('');
      setDescription('');
      setDate('');
      setModalOpen(false);
      loadMilestones(); // reload
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.milestones.toggleMilestone(id);
      loadMilestones();
    } catch (err) {
      console.error(err);
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
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">VENTURE CHRONOLOGY</span>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">Venture Milestones</h1>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)} className="mt-4 sm:mt-0">
          <Plus size={14} className="mr-2" /> Log Milestone
        </Button>
      </div>

      <div className="max-w-3xl mx-auto space-y-12 py-6">
        
        {/* Core Timeline block */}
        <div className="relative border-l border-charcoal/10 pl-8 ml-4 space-y-10">
          
          <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 rounded-full bg-charcoal/20"></div>
          
          {milestones.length > 0 ? (
            milestones.map((ms) => (
              <div key={ms.id} className="relative animate-fade-in group">
                
                {/* Visual timeline node icon */}
                <button
                  onClick={() => handleToggle(ms.id)}
                  className="absolute -left-[45px] top-1.5 p-1 rounded-full bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 cursor-pointer"
                >
                  {ms.completed ? (
                    <CheckCircle2 className="text-gold fill-gold/5" size={22} />
                  ) : (
                    <Circle className="text-charcoal/30 hover:text-gold" size={22} />
                  )}
                </button>
                
                <Card className={`p-6 border transition-all duration-200 bg-ivory ${ms.completed ? 'border-charcoal/5' : 'border-dashed border-charcoal/15 opacity-80'}`}>
                  {/* Meta date */}
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-brown mb-2">
                    <div className="flex items-center space-x-1 font-mono">
                      <Calendar size={10} />
                      <span>{ms.date}</span>
                    </div>
                    <span className={`font-semibold uppercase tracking-wider text-[9px] ${ms.completed ? 'text-gold' : 'text-brown'}`}>
                      {ms.completed ? 'Achieved' : 'Scheduled'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-serif font-semibold text-charcoal mb-1.5">{ms.title}</h3>
                  <p className="text-xs text-brown leading-relaxed font-light">{ms.description}</p>
                </Card>

              </div>
            ))
          ) : (
            <div className="text-center py-16 pl-0 bg-ivory/40 rounded border border-dashed border-charcoal/10">
              <Milestone size={32} className="text-brown/50 mx-auto mb-3" />
              <h4 className="text-sm font-serif font-semibold text-charcoal">No milestones tracked yet</h4>
              <p className="text-xs text-brown max-w-xs mx-auto mt-1 font-light leading-relaxed">
                Log critical pivot goals, products created, or initial revenue markers to track your company's growth track.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Venture Milestone"
      >
        <form onSubmit={handleCreateMilestone} className="space-y-5">
          <Input
            label="Milestone Title"
            placeholder="e.g. Launched pilot landing page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Milestone Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-brown font-sans">Milestone Details</label>
            <textarea
              rows={3}
              placeholder="Provide a brief context of what was accomplished and validated..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ivory border border-charcoal/20 focus:border-gold rounded p-4 text-sm text-charcoal outline-none font-sans"
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2">
            Add to Venture Timeline
          </Button>
        </form>
      </Modal>

    </div>
  );
};
