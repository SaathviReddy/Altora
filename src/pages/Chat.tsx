import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Database, ArrowRight, User as UserIcon } from 'lucide-react';
import { api, User, BusinessProfile, Task, Transaction } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const Chat: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [financeSummary, setFinanceSummary] = useState<{ investment: number; revenue: number; expenses: number; profit: number } | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadContext = async () => {
    try {
      const activeProfile = await api.business.getProfile();
      setProfile(activeProfile);

      const t = await api.tasks.getTasks();
      setTasks(t.slice(0, 3)); // show top 3 tasks

      const fin = await api.finance.getSummary();
      setFinanceSummary(fin);

      // Load chat history from backend database
      const chatHistory = await api.chat.getMessages();
      setMessages(chatHistory);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContext();
  }, []);

  useEffect(() => {
    // Scroll to bottom on message updates
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || responding) return;

    const userMsgText = inputText;
    const userMsg: ChatMessage = {
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setResponding(true);

    try {
      const aiResponse = await api.chat.sendMessage(userMsgText);
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return <Skeleton message="Reviewing your business context..." />;
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col h-full text-left animate-fade-in">
      
      {/* Title Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-gold font-bold">OPERATIONS MATRIX</span>
        <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">AI Chat Workspace</h1>
      </div>

      {/* Main Grid: Left Chat Area, Right Context Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 items-stretch min-h-[500px]">
        
        {/* Left Area: Chat messages stream */}
        <Card className="lg:col-span-3 flex flex-col justify-between p-0 border border-charcoal/10 bg-ivory overflow-hidden h-full">
          
          {/* Messages Stream */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[450px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3.5 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar dot */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-charcoal text-cream' : 'bg-gold/10 text-gold border border-gold/20'}`}>
                  {msg.sender === 'user' ? <UserIcon size={14} /> : <Sparkles size={14} />}
                </div>

                {/* Bubble content */}
                <div className={`p-4 rounded text-xs leading-relaxed font-sans ${msg.sender === 'user' ? 'bg-cream text-charcoal border border-charcoal/5' : 'bg-cream/40 text-charcoal'}`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="block mt-2 text-[9px] text-brown/65 text-right font-light font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {responding && (
              <div className="flex items-start space-x-3.5 max-w-lg">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold border border-gold/20 flex items-center justify-center animate-pulse">
                  <Sparkles size={14} />
                </div>
                <div className="p-4 rounded text-xs bg-cream/40 text-brown font-light italic font-sans animate-pulse">
                  Altora advisor is reviewing your business context...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-charcoal/5 p-4 flex items-center bg-cream/20">
            <input
              type="text"
              placeholder="Query advisor (e.g. Analyze pricing tiers, Review my SWOT metrics...)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={responding}
              className="flex-1 bg-ivory border border-charcoal/10 focus:border-gold rounded-l px-4 py-3 text-xs text-charcoal outline-none placeholder-charcoal/40"
              required
            />
            <Button
              type="submit"
              variant="primary"
              disabled={responding}
              className="py-3 px-5 rounded-r rounded-l-none"
            >
              <Send size={14} />
            </Button>
          </form>

        </Card>

        {/* Right Area: Persistent Context side panel */}
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-xs uppercase tracking-widest text-brown font-semibold flex items-center mb-1">
            <Database size={12} className="mr-1.5 text-gold" /> Persistent Context
          </h4>

          {/* Active Context Panel Widget */}
          <Card className="p-5 border border-charcoal/5 bg-ivory space-y-5 text-xs text-charcoal font-sans">
            <div>
              <span className="text-[10px] text-brown uppercase font-bold tracking-wider">Active Venture</span>
              <p className="font-serif font-semibold text-charcoal mt-0.5 truncate">{profile?.industry || 'B2B Consulting'}</p>
            </div>

            <hr className="border-charcoal/5" />

            <div>
              <span className="text-[10px] text-brown uppercase font-bold tracking-wider">Objectives List</span>
              <div className="space-y-1.5 mt-1.5">
                {profile?.goals?.slice(0, 2).map((g, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-charcoal">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0"></span>
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-charcoal/5" />

            <div>
              <span className="text-[10px] text-brown uppercase font-bold tracking-wider">Balance Sheet Snapshot</span>
              <div className="flex justify-between items-center mt-1 text-[11px]">
                <span className="text-brown">Revenue</span>
                <span className="font-semibold">${financeSummary?.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-brown">Costs</span>
                <span className="font-semibold">${financeSummary?.expenses.toLocaleString()}</span>
              </div>
            </div>

            <hr className="border-charcoal/5" />

            <div>
              <span className="text-[10px] text-brown uppercase font-bold tracking-wider">Active Tasks</span>
              <div className="space-y-1.5 mt-1.5">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center space-x-2 text-[11px] text-charcoal">
                    <span className={`w-2 h-2 border rounded-full ${t.completed ? 'bg-gold border-gold' : 'border-charcoal/30'}`}></span>
                    <span className={`truncate ${t.completed ? 'line-through text-brown/70' : ''}`}>{t.title}</span>
                  </div>
                ))}
              </div>
            </div>

          </Card>
        </div>

      </div>

    </div>
  );
};
