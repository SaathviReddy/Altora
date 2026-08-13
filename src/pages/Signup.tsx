import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.auth.getMe().then((user) => {
      if (user) {
        if (user.hasOnboarded) {
          navigate('/app/workspace');
        } else {
          navigate('/onboarding');
        }
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email address are required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.auth.signup(email, name, businessName || undefined);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between py-12 px-6 font-sans select-none">
      
      {/* Header Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Briefcase size={20} className="text-gold" />
          <span className="font-serif font-semibold text-charcoal tracking-widest">ALTORA</span>
        </Link>
        <Link to="/login" className="text-xs uppercase tracking-wider text-brown hover:text-charcoal transition-colors font-semibold">
          Sign In
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <Card className="p-8 border border-charcoal/10 bg-ivory">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-medium text-charcoal mb-2">Create Workspace</h2>
            <p className="text-xs text-brown uppercase tracking-wider">Deploy your founder environment</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 rounded text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Founder Full Name"
              type="text"
              placeholder="e.g. Alexis Carter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. founder@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Business Name (Optional)"
              type="text"
              placeholder="e.g. Verdant Craft"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={loading}
            />
            
            <Input
              label="Security Key"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <div className="text-left py-0.5">
              <span className="text-[10px] text-brown uppercase tracking-widest font-semibold flex items-center">
                <ShieldCheck size={12} className="text-gold mr-1.5" /> Demo Mode Enabled: Enter details to setup local workspace.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              disabled={loading}
            >
              {loading ? 'Registering Environment...' : 'Deploy Workspace'} <ArrowRight className="ml-2" size={16} />
            </Button>
          </form>
        </Card>
      </div>

      {/* Footer copyright */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-brown">
        <span>© {new Date().getFullYear()} Altora OS. Secure founder encryption.</span>
      </div>

    </div>
  );
};
