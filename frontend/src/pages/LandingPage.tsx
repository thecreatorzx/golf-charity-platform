import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Trophy, Heart, ChevronRight, Dices, Star, Users } from 'lucide-react';

import { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },

  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function FloatingOrb({ cx, cy, r, opacity }: { cx: string; cy: string; r: string; opacity: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={`rgba(200,240,77,${opacity})`} />;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080a0e] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#C8F04D]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#C8F04D]/[0.03] rounded-full blur-[100px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C8F04D] flex items-center justify-center">
            <Target size={18} className="text-black" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">GolfCharity</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors px-4 py-2">Sign in</Link>
          <Link to="/register" className="bg-[#C8F04D] text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#d4f76a] transition-all shadow-[0_0_20px_rgba(200,240,77,0.25)] hover:shadow-[0_0_30px_rgba(200,240,77,0.4)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <div className="inline-flex items-center gap-2 bg-[#C8F04D]/10 border border-[#C8F04D]/20 rounded-full px-4 py-1.5 text-[#C8F04D] text-xs font-bold uppercase tracking-widest mb-8">
            <Heart size={12} fill="currentColor" /> Play Golf · Win Prizes · Change Lives
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
          Golf with a<br />
          <span className="text-[#C8F04D]">Purpose.</span>
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Subscribe to the platform, track your Stableford scores, enter monthly prize draws,
          and give back to the charity that matters to you.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="group flex items-center gap-2 bg-[#C8F04D] text-black font-black text-base px-8 py-4 rounded-2xl hover:bg-[#d4f76a] transition-all shadow-[0_0_30px_rgba(200,240,77,0.3)] hover:shadow-[0_0_50px_rgba(200,240,77,0.5)]">
            Subscribe Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/charities" className="flex items-center gap-2 text-white/60 hover:text-white font-semibold text-base px-6 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
            <Heart size={16} /> Start Exploring Charities
          </Link>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-3">How It Works</h2>
          <p className="text-white/40">Three simple steps to play, win, and give.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Target, step: '01', title: 'Track Your Scores', desc: 'Log your last 5 Stableford scores. Each entry is your lottery ticket for the monthly draw.' },
            { icon: Dices, step: '02', title: 'Enter the Draw', desc: 'Your scores enter you into prize draws. Match 3, 4, or 5 numbers to win your tier of the pool.' },
            { icon: Heart, step: '03', title: 'Support Charity', desc: 'A portion of every subscription goes directly to the charity you choose. Golf with purpose.' },
          ].map(({ icon: Icon, step, title, desc }, i) => (
            <motion.div key={step} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}>
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 h-full hover:border-[#C8F04D]/20 transition-colors group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D] group-hover:bg-[#C8F04D]/20 transition-colors">
                    <Icon size={18} />
                  </div>
                  <span className="text-4xl font-black text-white/5 ml-auto">{step}</span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Prize pool */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/[0.03] border border-white/8 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <div className="text-[#C8F04D] text-xs font-bold uppercase tracking-widest mb-3">Monthly Prize Pool</div>
              <h2 className="text-3xl font-black mb-3">Win Real Money<br />Every Month</h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-md">
                A fixed share of every subscription goes into the prize pool. Match your Stableford scores to the draw numbers and claim your winnings.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-[260px]">
              {[
                { label: '5-Number Match', share: '40%', icon: Trophy, note: 'Jackpot · Rolls over' },
                { label: '4-Number Match', share: '35%', icon: Star, note: 'Guaranteed monthly' },
                { label: '3-Number Match', share: '25%', icon: Target, note: 'Most frequent win' },
              ].map(({ label, share, icon: Icon, note }) => (
                <div key={label} className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D]">
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{label}</div>
                    <div className="text-white/30 text-xs">{note}</div>
                  </div>
                  <div className="text-[#C8F04D] font-black text-lg">{share}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="bg-gradient-to-br from-[#C8F04D]/10 via-transparent to-transparent border border-[#C8F04D]/15 rounded-3xl p-12">
          <div className="w-14 h-14 rounded-2xl bg-[#C8F04D]/15 flex items-center justify-center text-[#C8F04D] mx-auto mb-5">
            <Users size={24} />
          </div>
          <h2 className="text-4xl font-black mb-3">Ready to play<br />with purpose?</h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto">Join a community of golfers who compete, win, and make a real difference.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-[#C8F04D] text-black font-black text-base px-8 py-4 rounded-2xl hover:bg-[#d4f76a] transition-all shadow-[0_0_40px_rgba(200,240,77,0.3)]">
            Subscribe & Start Playing <ChevronRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 px-6 py-8 max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#C8F04D] flex items-center justify-center">
            <Target size={12} className="text-black" />
          </div>
          <span className="text-white/40 text-sm">GolfCharity Platform</span>
        </div>
        <div className="text-white/20 text-xs">© 2026 All rights reserved</div>
      </footer>
    </div>
  );
}