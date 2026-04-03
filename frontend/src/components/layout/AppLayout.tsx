import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Heart, Trophy, Settings,
  LogOut, Menu, X, ChevronRight, Shield, Users,
  BarChart3, Dices
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const userNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scores', icon: Target, label: 'My Scores' },
  { to: '/draws', icon: Dices, label: 'Draws' },
  { to: '/charities', icon: Heart, label: 'Charities' },
  { to: '/winnings', icon: Trophy, label: 'Winnings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminNav = [
  { to: '/admin', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/draws', icon: Dices, label: 'Draw Engine' },
  { to: '/admin/charities', icon: Heart, label: 'Charities' },
  { to: '/admin/winners', icon: Trophy, label: 'Winners' },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof LayoutDashboard; label: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active ? 'bg-[#C8F04D]/10 text-[#C8F04D]' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
        <Icon size={18} className={active ? 'text-[#C8F04D]' : 'group-hover:text-white/60'} />
        <span>{label}</span>
        {active && <ChevronRight size={14} className="ml-auto" />}
      </div>
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C8F04D] flex items-center justify-center">
            <Target size={18} className="text-black" />
          </div>
          <div>
            <div className="text-white font-black text-sm tracking-tight">GolfCharity</div>
            <div className="text-white/30 text-[10px] uppercase tracking-widest">Platform</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/40">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {isAdmin ? (
          <>
            <div className="px-3 py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
              <Shield size={10} /> Admin
            </div>
            {adminNav.map((item) => <NavItem key={item.to} {...item} />)}
            <div className="my-3 border-t border-white/8" />
          </>
        ):(
          <>
        <div className="px-3 py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">My Account</div>
        {userNav.map((item) => <NavItem key={item.to} {...item} />)}
        </>
        )}
        </nav>

      {/* User */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#C8F04D]/20 flex items-center justify-center text-[#C8F04D] text-sm font-black">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-white/30 text-xs truncate">{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080a0e] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/8 bg-[#080a0e] fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/8 bg-[#080a0e] lg:hidden"
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-white/8 sticky top-0 z-20 bg-[#080a0e]/80 backdrop-blur-md">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-white/60">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C8F04D] flex items-center justify-center">
              <Target size={14} className="text-black" />
            </div>
            <span className="font-black text-white text-sm">GolfCharity</span>
          </div>
        </div>
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}