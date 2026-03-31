import { SetStateAction, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, Dices, TrendingUp, Activity } from 'lucide-react';
import { adminGetAnalytics } from '../../api/services';
import { Card, StatCard } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';

interface Analytics {
  totalUsers: number;
  activeSubscriptions: number;
  totalDraws: number;
  totalWinners: number;
  totalCharityContributions: number;
  totalPrizePool?: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetAnalytics()
      .then((r: { data: SetStateAction<Analytics | null>; }) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D]">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Analytics</h1>
              <p className="text-white/40 text-sm">Platform-wide overview</p>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users', value: data?.totalUsers ?? 0, icon: <Users size={18} />, sub: 'Registered accounts' },
            { label: 'Active Subscriptions', value: data?.activeSubscriptions ?? 0, icon: <TrendingUp size={18} />, sub: 'Currently active' },
            { label: 'Total Draws', value: data?.totalDraws ?? 0, icon: <Dices size={18} />, sub: 'Draws published' },
            { label: 'Total Winners', value: data?.totalWinners ?? 0, icon: <Trophy size={18} />, sub: 'Prize recipients' },
            { label: 'Charity Contributions', value: `₹${(data?.totalCharityContributions ?? 0).toLocaleString()}`, icon: <Heart size={18} />, sub: 'Total donated' },
            { label: 'Total Prize Pool', value: `₹${(data?.totalPrizePool ?? 0).toLocaleString()}`, icon: <Activity size={18} />, sub: 'All time' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Prize pool breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <Trophy size={16} className="text-[#C8F04D]" /> Prize Pool Distribution
            </h2>
            <div className="space-y-4">
              {[
                { label: '5-Number Jackpot', share: 40, color: 'bg-[#C8F04D]', note: 'Rolls over if unclaimed' },
                { label: '4-Number Match', share: 35, color: 'bg-blue-400', note: 'Monthly guaranteed' },
                { label: '3-Number Match', share: 25, color: 'bg-orange-400', note: 'Most frequent tier' },
              ].map(({ label, share, color, note }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-white text-sm font-semibold">{label}</span>
                      <span className="text-white/30 text-xs ml-2">{note}</span>
                    </div>
                    <span className="text-white font-black">{share}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${share}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}