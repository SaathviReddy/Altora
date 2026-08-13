import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
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
    if (!email) {
      setError('Email address is required.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const user = await api.auth.login(email);
      if (user.hasOnboarded) {
        navigate('/app/workspace');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between py-12 px-6 font-sans select-none">
      
      {/* Header Back Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Briefcase size={20} className="text-gold" />
          <span className="font-serif font-semibold text-charcoal tracking-widest">ALTORA</span>
        </Link>
        <Link to="/signup" className="text-xs uppercase tracking-wider text-brown hover:text-charcoal transition-colors font-semibold">
          Create Account
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-10">
        <Card className="p-8 border border-charcoal/10 bg-ivory">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-medium text-charcoal mb-2">Welcome Back</h2>
            <p className="text-xs text-brown uppercase tracking-wider">Access your strategy command center</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 rounded text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              label="Security Key"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <div className="text-left py-0.5">
              <span className="text-[10px] text-brown uppercase tracking-widest font-semibold flex items-center">
                <ShieldCheck size={12} className="text-gold mr-1.5" /> Demo Mode Enabled: Enter any email to continue.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              disabled={loading}
            >
              {loading ? 'Authenticating Credentials...' : 'Sign In to Workspace'} <ArrowRight className="ml-2" size={16} />
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
