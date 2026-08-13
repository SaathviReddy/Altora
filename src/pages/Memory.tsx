import React, { useState, useEffect } from 'react';
import { Brain, Search, Plus, Filter, Calendar, Tag, ArrowRight } from 'lucide-react';
import { api, Memory } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';

export const MemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Add Memory Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Memory['category']>('Business');
  const [newContent, setNewContent] = useState('');

  const loadMemories = async () => {
    try {
      const list = await api.memory.getMemories();
      setMemories(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    try {
      await api.memory.addMemory(newCategory, newTitle, newContent);
      setNewTitle('');
      setNewContent('');
      setModalOpen(false);
      loadMemories(); // reload list
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    'All',
    'Business',
    'Ideas',
    'Goals',
    'Decisions',
    'Finance',
    'Tasks',
    'Milestones',
    'Advisor Reports',
    'Conversations'
  ];

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <Skeleton message="Reviewing your business context..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">BUSINESS BRAIN</span>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">AI Memory</h1>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)} className="mt-4 sm:mt-0">
          <Plus size={14} className="mr-2" /> Log Decision Memory
        </Button>
      </div>

      {/* Filter / Search Bar controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-brown/60" size={16} />
          <input
            type="text"
            placeholder="Search decisions, milestones, or conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-ivory border border-charcoal/15 focus:border-gold rounded text-xs text-charcoal outline-none placeholder-charcoal/40"
          />
        </div>
        
        {/* Category list filters */}
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 whitespace-nowrap scrollbar-none">
          <Filter size={12} className="text-brown flex-shrink-0 mr-1" />
          <div className="flex space-x-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] uppercase tracking-wider px-3 py-1.5 border rounded transition-colors focus:outline-none ${selectedCategory === cat ? 'bg-charcoal text-cream font-semibold border-charcoal' : 'bg-ivory/50 border-charcoal/10 text-brown hover:border-charcoal/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Memory Timeline */}
      <div className="relative border-l border-charcoal/10 pl-6 md:pl-8 ml-3 py-4 space-y-8">
        {filteredMemories.length > 0 ? (
          filteredMemories.map((m, idx) => (
            <div key={m.id} className="relative animate-fade-in">
              {/* Timeline circle point */}
              <div className="absolute -left-[33px] md:-left-[41px] top-1.5 w-3 h-3 rounded-full bg-gold border-2 border-cream ring-4 ring-cream z-10"></div>
              
              <Card className="p-6 border border-charcoal/5 bg-ivory shadow-xs">
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] uppercase tracking-wider text-brown mb-2.5 gap-1.5">
                  <div className="flex items-center space-x-2 font-semibold">
                    <Tag size={10} className="text-gold" />
                    <span>{m.category}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={10} />
                    <span>{new Date(m.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Content details */}
                <h3 className="text-base font-serif font-semibold text-charcoal mb-2">{m.title}</h3>
                <p className="text-xs text-brown leading-relaxed font-sans">{m.content}</p>

                {m.relatedContext && (
                  <div className="mt-4 pt-3 border-t border-charcoal/5 flex items-center text-[10px] text-gold uppercase tracking-wider font-semibold">
                    <span>Linked context: {m.relatedContext}</span>
                    <ArrowRight size={10} className="ml-1" />
                  </div>
                )}
              </Card>
            </div>
          ))
        ) : (
          <div className="text-center py-16 pl-0 bg-ivory/40 rounded border border-dashed border-charcoal/10">
            <Brain size={32} className="text-brown/50 mx-auto mb-3" />
            <h4 className="text-sm font-serif font-semibold text-charcoal">No memories match your query</h4>
            <p className="text-xs text-brown max-w-xs mx-auto mt-1 font-light leading-relaxed">
              Log important strategic pivot points, goals adjustments, or finance transactions to catalog them in your memory workspace.
            </p>
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Strategic Decision Memory"
      >
        <form onSubmit={handleCreateMemory} className="space-y-5">
          <Input
            label="Memory Title / Decision Summary"
            placeholder="e.g. Pivoted pricing structure to retainer"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-brown">Category</label>
            <select
              value={newCategory}
              onChange={(e: any) => setNewCategory(e.target.value)}
              className="w-full bg-ivory border border-charcoal/20 focus:border-gold rounded px-4 py-2.5 text-sm text-charcoal outline-none font-sans"
            >
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-brown font-sans">Memory Content / Log Context</label>
            <textarea
              rows={4}
              placeholder="Detail the parameters of your decision, reasons, and notes..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-ivory border border-charcoal/20 focus:border-gold rounded p-4 text-sm text-charcoal outline-none font-sans"
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2">
            Commit to Memory database
          </Button>
        </form>
      </Modal>

    </div>
  );
};
