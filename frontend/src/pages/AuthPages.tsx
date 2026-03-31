import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { login, register } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-[#080a0e] flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-[#C8F04D]/4 rounded-full blur-[100px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#C8F04D] flex items-center justify-center">
              <Target size={20} className="text-black" />
            </div>
            <span className="font-black text-white text-xl">GolfCharity</span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">{title}</h1>
          <p className="text-white/40 text-sm">{subtitle}</p>
        </div>
        <div className="bg-white/4 border border-white/10 rounded-2xl p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      setUser(res.data.user);
      navigate(res.data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={15} />} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#C8F04D]/60 transition-all"
              required
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">Sign In</Button>
      </form>
      <p className="text-center text-white/40 text-sm mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#C8F04D] font-semibold hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register({ name, email, password });
      setUser(res.data.user);
      navigate('/subscribe');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join the community. Play with purpose.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full Name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} icon={<User size={15} />} required />
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={15} />} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#C8F04D]/60 transition-all"
              required minLength={8}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">Create Account</Button>
      </form>
      <p className="text-center text-white/40 text-sm mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-[#C8F04D] font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}