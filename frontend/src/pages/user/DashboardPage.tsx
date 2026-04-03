import { SetStateAction, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Trophy, Heart, Dices, ChevronRight, TrendingUp, Calendar } from 'lucide-react';
import { getDashboard } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, StatCard, EmptyState } from '@/components/ui';
import AppLayout from '@/components/layout/AppLayout';

interface DashboardData {
  subscription: { status: string; plan: string; currentPeriodEnd?: string } | null;
  scores: { id: string; score: number; datePlayed: string }[];
  charity: { charity: { name: string }; percentage: number } | null;
  draws: { total: number; upcoming: string };
  winnings: { total: number; pending: number; paid: number };
}

function scoreStatusBadge(status: string) {
  if (status === 'ACTIVE') return <Badge variant="green">Active</Badge>;
  if (status === 'INACTIVE') return <Badge variant="red">Inactive</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((r: { data: SetStateAction<DashboardData | null>; }) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
      </div>
    </AppLayout>
  );

  const needsSubscription = !data?.subscription || data.subscription.status !== 'ACTIVE';

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-black text-white">
            Good to see you, <span className="text-[#C8F04D]">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Here's your platform overview.</p>
        </motion.div>

        {/* Subscription banner */}
        {needsSubscription && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-gradient-to-r from-[#C8F04D]/15 to-transparent border border-[#C8F04D]/20 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-white text-sm mb-1">No Active Subscription</div>
              <p className="text-white/40 text-xs">Subscribe to enter monthly draws and track your scores.</p>
            </div>
            <Link to="/subscribe" className="flex-shrink-0 flex items-center gap-2 bg-[#C8F04D] text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#d4f76a] transition-all whitespace-nowrap">
              Subscribe Now <ChevronRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Subscription"
            value={data?.subscription?.status || 'None'}
            sub={data?.subscription?.currentPeriodEnd ? `Renews ${new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}` : undefined}
            icon={<Target size={18} />}
          />
          <StatCard
            label="Scores Logged"
            value={data?.scores?.length || 0}
            sub="Last 5 retained"
            icon={<TrendingUp size={18} />}
          />
          <StatCard
            label="Total Winnings"
            value={`₹${data?.winnings?.total || 0}`}
            sub={`₹${data?.winnings?.pending || 0} pending`}
            icon={<Trophy size={18} />}
          />
          <StatCard
            label="Charity %"
            value={data?.charity ? `${data.charity.percentage}%` : '—'}
            sub={data?.charity?.charity?.name || 'Not selected'}
            icon={<Heart size={18} />}
          />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Scores */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-white flex items-center gap-2">
                <Target size={16} className="text-[#C8F04D]" /> Recent Scores
              </div>
              <Link to="/scores" className="text-[#C8F04D] text-xs hover:underline flex items-center gap-1">
                Manage <ChevronRight size={12} />
              </Link>
            </div>
            {data?.scores?.length ? (
              <div className="space-y-2">
                {data.scores.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-7 h-7 rounded-lg bg-[#C8F04D]/10 text-[#C8F04D] flex items-center justify-center text-xs font-black">{i + 1}</div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm">{s.score} pts</div>
                      <div className="text-white/30 text-xs flex items-center gap-1"><Calendar size={10} />{new Date(s.datePlayed).toLocaleDateString()}</div>
                    </div>
                    <div className="text-white/30 text-xs">Stableford</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Target />} title="No scores yet" description="Add your first Stableford score to enter draws." />
            )}
          </Card>

          {/* Subscription & Draws */}
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <Dices size={16} className="text-[#C8F04D]" /> Draw Participation
                </div>
                <Link to="/draws" className="text-[#C8F04D] text-xs hover:underline flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-black text-white">{data?.draws?.total || 0}</div>
                  <div className="text-white/40 text-xs">Draws entered</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <div className="text-sm font-semibold text-white">{data?.draws?.upcoming || 'N/A'}</div>
                  <div className="text-white/40 text-xs">Next draw</div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <Heart size={16} className="text-[#C8F04D]" /> Charity Contribution
                </div>
                <Link to="/charities" className="text-[#C8F04D] text-xs hover:underline flex items-center gap-1">
                  Change <ChevronRight size={12} />
                </Link>
              </div>
              {data?.charity ? (
                <div>
                  <div className="font-bold text-white mb-1">{data.charity.charity.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8F04D] rounded-full" style={{ width: `${data.charity.percentage}%` }} />
                    </div>
                    <span className="text-[#C8F04D] font-bold text-sm">{data.charity.percentage}%</span>
                  </div>
                  <p className="text-white/30 text-xs mt-2">of your subscription goes to this charity</p>
                </div>
              ) : (
                <EmptyState icon={<Heart />} title="No charity selected" description="Choose a charity to support with your subscription." />
              )}
            </Card>

            <Card className="p-5">
              <div className="font-bold text-white flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-[#C8F04D]" /> Winnings
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-black text-white">₹{data?.winnings?.total || 0}</div>
                  <div className="text-white/30 text-xs">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-yellow-400">₹{data?.winnings?.pending || 0}</div>
                  <div className="text-white/30 text-xs">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-emerald-400">₹{data?.winnings?.paid || 0}</div>
                  <div className="text-white/30 text-xs">Paid</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}