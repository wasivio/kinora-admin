import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, UserPlus, LogIn, User } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail, registerAdminWithEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (
      code === 'auth/invalid-credential' ||
      message.includes('auth/invalid-credential') ||
      code === 'auth/wrong-password' ||
      message.includes('auth/wrong-password')
    ) {
      return 'Wrong password! Please check your credentials and try again.';
    }
    if (code === 'auth/user-not-found' || message.includes('auth/user-not-found')) {
      return 'No account found with this email. Please check your email or register as Admin.';
    }
    if (code === 'auth/email-already-in-use' || message.includes('auth/email-already-in-use')) {
      return 'This email is already registered. Please sign in instead.';
    }
    if (code === 'auth/weak-password' || message.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (code === 'auth/invalid-email' || message.includes('auth/invalid-email')) {
      return 'Invalid email address format. Please enter a valid email.';
    }
    if (code === 'auth/too-many-requests' || message.includes('auth/too-many-requests')) {
      return 'Too many failed login attempts. Please wait a moment and try again.';
    }
    if (code === 'auth/network-request-failed' || message.includes('auth/network-request-failed')) {
      return 'Network connection error. Please check your internet connection.';
    }

    if (message && !message.startsWith('Firebase:')) {
      return message;
    }

    return 'Wrong password or credentials. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerAdminWithEmail(email.trim(), password, displayName.trim());
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-gold-primary selection:text-black">
      {/* Background Decorative Gold Halo Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Official KINORA Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-black border border-gold-primary/40 shadow-gold-glow mb-4">
            <img
              src="/kinora-logo.png"
              alt="KINORA Official Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-[0.25em] text-white uppercase text-gold-gradient">
            KINORA
          </h1>
          <p className="text-xs tracking-widest text-zinc-400 mt-1 uppercase font-medium">
            Maison de Luxe • Admin Portal
          </p>
        </div>

        <div className="bg-[#121215]/90 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Toggle between Sign In and Register Admin */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {mode === 'login' ? 'Authorized Access' : 'Register New Admin'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {mode === 'login'
                  ? 'Sign in with your verified administrator credentials'
                  : 'Create a new administrator account for KINORA'}
              </p>
            </div>
          </div>

          <div className="flex rounded-lg bg-zinc-900/80 p-1 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-gold-primary text-black font-semibold shadow-gold-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-gold-primary text-black font-semibold shadow-gold-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Admin</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-900/60 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Admin Full Name"
                placeholder="e.g. Yashu Patel"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@kinora.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              {mode === 'login' ? 'Sign In to Dashboard' : 'Register & Enter Dashboard'}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-zinc-500">
              <span className="text-emerald-400 font-medium">✓ Connected to Firebase Project kinora-62da7</span>
            </p>
          </div>
        </div>

        {/* Security Footer Notice */}
        <p className="text-center text-[11px] text-zinc-500 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-primary" />
          <span>Role-Based Firestore Admin Security Enabled</span>
        </p>
      </div>
    </div>
  );
};
