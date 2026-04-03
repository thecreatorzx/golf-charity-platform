import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, Calendar, Trophy, Target } from 'lucide-react';
import { getDraws, getDraw } from '../../api/services';
import { Card, Badge, EmptyState } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';

interface DrawWinner {
  matchType: string;
  prizeAmount: number;
  user: { name: string };
}

interface DrawResult {
  id: string;
  month: number;
  year: number;
  winningNumbers: number[];
  status: string;
  prizePool: number;
  publishedAt: string;
  _count?: {
    results: number;
  };
  results?: {
    matchType: string;
    prizeAmount: number;
    user: { name: string };
  }[];
}


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DrawsPage() {
  const [draws, setDraws] = useState<DrawResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<Record<string, DrawResult>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selected, setSelected] = useState<DrawResult | null>(null);

  useEffect(() => {
    getDraws()
      .then((r: { data: { draws: any; }; }) => {
        const data = r.data.draws || r.data;
        setDraws(data);
        if (data.length) handleSelect(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const matchColors: Record<string, string> = {
    FIVE_MATCH: 'text-[#C8F04D]',
    FOUR_MATCH: 'text-blue-400',
    THREE_MATCH: 'text-orange-400',
  };

  const matchLabel: Record<string, string> = {
    FIVE_MATCH: '5 Match 🏆 Jackpot',
    FOUR_MATCH: '4 Match',
    THREE_MATCH: '3 Match',
  };

  const handleSelect = async (d: DrawResult) => {
  const key = `${d.month}-${d.year}`;

  if (cache[key]) {
    setSelected(cache[key]);
    return;
  }

  setLoadingDetail(true);

  try {
    const month = Number(d.month);
    const year = Number(d.year);

    if (!Number.isInteger(month) || !Number.isInteger(year)) {
      throw new Error("Invalid month/year");
    }

    const res = await getDraw(month, year);
    const draw = res.data.draw;

    setSelected(draw);

    setCache((prev) => ({ ...prev, [key]: draw }));

  } catch (err) {
    console.error('Failed to fetch draw details', err);
  } finally {
    setLoadingDetail(false);
  }
};
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Monthly Draws</h1>
          <p className="text-white/40 text-sm mt-1">View published draw results and winning numbers</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
          </div>
        ) : draws.length === 0 ? (
          <EmptyState icon={<Dices />} title="No draws published yet" description="Check back after the next monthly draw is run." />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Draw list */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white/30 uppercase tracking-widest px-1 mb-3">All Draws</div>
              {draws.map((d) => (
                <button key={d.id} onClick={() => handleSelect(d)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.month === d.month && selected?.year === d.year ? 'bg-[#C8F04D]/10 border-[#C8F04D]/30 text-[#C8F04D]' : 'border-white/8 text-white/60 hover:border-white/15 hover:text-white/80 bg-white/[0.02]'}`}>
                  <div className="font-bold text-sm">{MONTHS[d.month - 1]} {d.year}</div>
                  <div className="text-xs mt-0.5 opacity-60">
                    {d._count?.results ?? d.results?.length ?? 0} winners · ₹{d.prizePool?.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>

            {/* Draw detail */}
            <div className="lg:col-span-2">
              {loadingDetail ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                  </div>
                ) : selected && (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="p-6" glow>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                          <Calendar size={10} /> {MONTHS[selected.month - 1]} {selected.year} Draw
                        </div>
                        <h2 className="text-xl font-black text-white">Draw Results</h2>
                      </div>
                      <Badge variant="green">Published</Badge>
                    </div>

                    {/* Winning numbers */}
                    <div className="mb-6">
                      <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Winning Numbers</div>
                      <div className="flex gap-3 flex-wrap">
                        {(selected.winningNumbers || []).map((n, i) => (
                          <motion.div key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                            className="w-14 h-14 rounded-2xl bg-[#C8F04D]/10 border border-[#C8F04D]/20 flex items-center justify-center text-[#C8F04D] font-black text-xl">
                            {n}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Prize pool */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { label: 'Total Pool', value: `₹${selected.prizePool?.toLocaleString() || 0}` },
                        { label: 'Winners', value: selected.results?.length || 0 },
                        { label: 'Published', value: new Date(selected.publishedAt).toLocaleDateString() },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                          <div className="text-white font-black">{value}</div>
                          <div className="text-white/30 text-xs mt-0.5">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Winners */}
                    {selected.results && selected.results.length > 0 ? (
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Winners</div>
                        <div className="space-y-2">
                          {selected.results.map((w, i) => (
                            <div key={i} className="flex items-center gap-3 py-2.5 px-4 bg-white/[0.03] rounded-xl">
                              <Trophy size={14} className={matchColors[w.matchType] || 'text-white/40'} />
                              <div className="flex-1">
                                <div className="text-white text-sm font-semibold">{w.user.name}</div>
                                <div className={`text-xs font-medium ${matchColors[w.matchType] || 'text-white/40'}`}>{matchLabel[w.matchType] || w.matchType}</div>
                              </div>
                              <div className="text-white font-black text-sm">₹{w.prizeAmount?.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-white/30 text-sm">
                        <Target size={20} className="mx-auto mb-2 opacity-30" />
                        No winners this round
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}