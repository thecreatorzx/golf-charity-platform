import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';
  const variants = {
    primary: 'bg-[#C8F04D] text-black hover:bg-[#d4f76a] focus:ring-[#C8F04D] shadow-[0_0_20px_rgba(200,240,77,0.3)] hover:shadow-[0_0_30px_rgba(200,240,77,0.5)]',
    secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/30 border border-white/20',
    ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/20',
    danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 focus:ring-red-500',
    outline: 'bg-transparent border border-[#C8F04D]/50 text-[#C8F04D] hover:bg-[#C8F04D]/10 focus:ring-[#C8F04D]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>}
        <input
          className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#C8F04D]/60 focus:bg-white/8 transition-all ${icon ? 'pl-10' : ''} ${error ? 'border-red-500/50' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Card
export function Card({ children, className = '', glow = false }: { children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-sm ${glow ? 'shadow-[0_0_40px_rgba(200,240,77,0.06)]' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Badge
type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray';
export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: BadgeVariant }) {
  const variants: Record<BadgeVariant, string> = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    gray: 'bg-white/10 text-white/60 border-white/10',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Modal
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`relative w-full ${sizes[size]} bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || true) && (
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                {title && <h3 className="font-bold text-white text-lg">{title}</h3>}
                <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Stat Card
export function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
          {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
        </div>
        {icon && <div className="w-10 h-10 rounded-xl bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D]">{icon}</div>}
      </div>
    </Card>
  );
}

// Empty State
export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-4 text-3xl">
        {icon}
      </div>
      <h3 className="text-white/60 font-semibold text-base">{title}</h3>
      {description && <p className="text-white/30 text-sm mt-1 max-w-xs">{description}</p>}
    </div>
  );
}

// Toast (simple)
export function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  const colors = {
    success: 'bg-[#C8F04D]/10 border-[#C8F04D]/30 text-[#C8F04D]',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg backdrop-blur-sm ${colors[type]}`}
    >
      {message}
    </motion.div>
  );
}