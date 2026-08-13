import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, User as UserIcon } from 'lucide-react';
import { api, User, BusinessProfile } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';

export const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form States
  const [founderName, setFounderName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [details, setDetails] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');

  const loadData = async () => {
    try {
      const currUser = await api.auth.getMe();
      setUser(currUser);
      if (currUser) {
        setFounderName(currUser.name);
        setBusinessName(currUser.businessName || '');
      }

      const activeProfile = await api.business.getProfile();
      setProfile(activeProfile);
      if (activeProfile) {
        setIndustry(activeProfile.industry || '');
        setDetails(activeProfile.details || '');
        setGoals(activeProfile.goals || []);
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

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setGoals([...goals, newGoal.trim()]);
    setNewGoal('');
  };

  const handleRemoveGoal = (idx: number) => {
    setGoals(goals.filter((_, i) => i !== idx));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      // 1. Update user credentials in localStorage
      const updatedUser: User = {
        email: user?.email || '',
        name: founderName,
        businessName: businessName,
        hasOnboarded: true
      };
      localStorage.setItem('altora_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // 2. Update business profile details
      await api.business.updateProfile({
        industry,
        details,
        goals
      });

      setSuccessMessage('Workspace environment settings successfully synchronized.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton message="Reviewing your business context..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-gold font-bold">WORKSPACE PARAMETERS</span>
        <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">Settings</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSaveSettings} className="space-y-8">
          
          {/* Founder Profiles Block */}
          <Card className="p-8 border border-charcoal/10 bg-ivory space-y-6">
            <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
              Founder Profile Settings
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Founder Name"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                required
              />
              <Input
                label="Registered Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          </Card>

          {/* Business Brain config */}
          <Card className="p-8 border border-charcoal/10 bg-ivory space-y-6">
            <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
              Business Brain Variables
            </h4>
            
            <Input
              label="Active Sector / Industry Niche"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-brown font-sans">Venture Executive Details</label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-ivory border border-charcoal/20 focus:border-gold rounded p-4 text-sm text-charcoal outline-none font-sans"
              />
            </div>
          </Card>

          {/* Goals and Objectives editor */}
          <Card className="p-8 border border-charcoal/10 bg-ivory space-y-6">
            <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
              Objectives & Target Goals
            </h4>

            {/* List existing goals */}
            <div className="space-y-2">
              {goals.map((g, idx) => (
                <div key={idx} className="flex justify-between items-center bg-cream/35 border border-charcoal/5 p-3.5 rounded text-xs">
                  <span className="text-charcoal font-sans">{g}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(idx)}
                    className="text-red-700 font-semibold hover:underline text-[10px] uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add new goal field */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Log a target objective (e.g. Set marketing retarget retainer...)"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="flex-1 bg-ivory border border-charcoal/20 focus:border-gold rounded px-4 py-2.5 text-xs text-charcoal outline-none placeholder-charcoal/40"
              />
              <Button type="button" variant="outline" onClick={handleAddGoal}>
                Add Target
              </Button>
            </div>
          </Card>

          {successMessage && (
            <div className="p-4 bg-green-50 border-l-2 border-green-500 text-xs text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="py-3 px-8"
            >
              <Save size={14} className="mr-2" /> 
              {saving ? 'Synchronizing parameters...' : 'Commit Settings changes'}
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
};
