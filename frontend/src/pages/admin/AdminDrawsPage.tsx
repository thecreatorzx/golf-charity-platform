import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Play, Send, Zap, Trophy, AlertTriangle, RefreshCw } from 'lucide-react';
import { simulateDraw, publishDraw, getDraws } from '../../api/services';
import { Button, Card, Badge, Modal } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';

interface SimResult {
  winningNumbers: number[];
  matches: { matchType: string; users: { name: string; email: string }[]; prizeAmount: number }[];
  prizePool: number;
  draw: {algorithm: string};
}

interface PublishedDraw {
  id: string;
  month: number;
  year: number;
  winningNumbers: number[];
  status: string;
  publishedAt: string;
  prizePool?: number;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const matchLabel: Record<string, string> = {
  FIVE_MATCH: '5-Number Jackpot',
  FOUR_MATCH: '4-Number Match',
  THREE_MATCH: '3-Number Match',
};

const matchColor: Record<string, string> = {
  FIVE_MATCH: 'text-[#C8F04D]',
  FOUR_MATCH: 'text-blue-400',
  THREE_MATCH: 'text-orange-400',
};

export default function AdminDrawsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [algorithm, setAlgorithm] = useState<'RANDOM' | 'WEIGHTED'>('RANDOM');
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState('');
  const [pastDraws, setPastDraws] = useState<PublishedDraw[]>([]);
  const [drawsLoading, setDrawsLoading] = useState(true);

  const fetchDraws = () => {
    setDrawsLoading(true);
    getDraws()
      .then((r: { data: { draws: any; }; }) => setPastDraws(r.data.draws || r.data))
      .catch(() => setPastDraws([]))
      .finally(() => setDrawsLoading(false));
  };

  useEffect(() => { fetchDraws(); }, []);

  const handleSimulate = async () => {
    setSimLoading(true);
    setSimError('');
    setSimResult(null);
    try {
      const r = await simulateDraw({ month, year, algorithm });
      setSimResult(r.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSimError(e?.response?.data?.message || 'Simulation failed');
    } finally {
      setSimLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishDraw({ month, year, algorithm });
      setPublishConfirm(false);
      setSimResult(null);
      setPublishSuccess(`${MONTHS[month - 1]} ${year} draw published successfully!`);
      fetchDraws();
      setTimeout(() => setPublishSuccess(''), 4000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSimError(e?.response?.data?.message || 'Publish failed');
      setPublishConfirm(false);
    } finally {
      setPublishing(false);
    }
  };

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D]">
            <Dices size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Draw Engine</h1>
            <p className="text-white/40 text-sm">Simulate and publish monthly draws</p>
          </div>
        </div>

        {publishSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm font-semibold">
            ✓ {publishSuccess}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Config panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={15} className="text-[#C8F04D]" /> Draw Configuration
              </h2>

              {/* Month */}
              <div className="mb-4">
                <label className="text-xs text-white/40 uppercase tracking-widest font-semibold block mb-2">Month</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTHS.map((m, i) => (
                    <button key={m} onClick={() => setMonth(i + 1)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${month === i + 1 ? 'bg-[#C8F04D]/15 text-[#C8F04D] border border-[#C8F04D]/30' : 'text-white/40 hover:text-white/60 border border-white/5 hover:border-white/15'}`}>
                      {m.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year */}
              <div className="mb-4">
                <label className="text-xs text-white/40 uppercase tracking-widest font-semibold block mb-2">Year</label>
                <div className="flex gap-2">
                  {years.map((y) => (
                    <button key={y} onClick={() => setYear(y)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${year === y ? 'bg-[#C8F04D]/15 text-[#C8F04D] border border-[#C8F04D]/30' : 'text-white/40 border border-white/5 hover:border-white/15'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Algorithm */}
              <div className="mb-5">
                <label className="text-xs text-white/40 uppercase tracking-widest font-semibold block mb-2">Algorithm</label>
                <div className="space-y-2">
                  {(['RANDOM', 'WEIGHTED'] as const).map((a) => (
                    <button key={a} onClick={() => setAlgorithm(a)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${algorithm === a ? 'bg-[#C8F04D]/10 border-[#C8F04D]/30' : 'border-white/8 hover:border-white/15'}`}>
                      <div className={`font-bold text-sm ${algorithm === a ? 'text-[#C8F04D]' : 'text-white/60'}`}>{a}</div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {a === 'RANDOM' ? 'Standard lottery-style random draw' : 'Weighted by most/least frequent scores'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {simError && (
                <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-xs">{simError}</div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={handleSimulate} loading={simLoading} variant="secondary" className="w-full">
                  <Play size={14} /> Run Simulation
                </Button>
                <Button onClick={() => setPublishConfirm(true)} className="w-full" disabled={!simResult}>
                  <Send size={14} /> Publish Draw
                </Button>
              </div>
              {!simResult && <p className="text-white/20 text-xs text-center mt-2">Simulate first to preview results</p>}
            </Card>
          </div>

          {/* Results panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {simLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#C8F04D]/10 flex items-center justify-center">
                    <Dices size={22} className="text-[#C8F04D] animate-bounce" />
                  </div>
                  <p className="text-white/40 text-sm">Running draw simulation...</p>
                </motion.div>
              ) : simResult ? (
                <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6" glow>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-0.5">Simulation Result</div>
                        <h3 className="font-black text-white text-lg">{MONTHS[month - 1]} {year}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="blue">{simResult.draw?.algorithm}</Badge>
                        <button onClick={handleSimulate} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40">
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Winning numbers */}
                    <div className="mb-5">
                      <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Winning Numbers</div>
                      <div className="flex gap-2 flex-wrap">
                        {(simResult.winningNumbers || []).map((n, i) => (
                          <motion.div key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 400 }}
                            className="w-12 h-12 rounded-xl bg-[#C8F04D]/15 border border-[#C8F04D]/30 flex items-center justify-center text-[#C8F04D] font-black text-lg">
                            {n}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Prize pool */}
                    <div className="bg-white/5 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
                      <span className="text-white/50 text-sm">Total Prize Pool</span>
                      <span className="text-[#C8F04D] font-black text-lg">₹{simResult.prizePool?.toLocaleString()}</span>
                    </div>

                    {/* Match results */}
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Match Results</div>
                      <div className="space-y-3">
                        {(simResult.matches || []).map((m) => (
                          <div key={m.matchType} className="border border-white/8 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Trophy size={14} className={matchColor[m.matchType] || 'text-white/40'} />
                                <span className={`font-bold text-sm ${matchColor[m.matchType] || 'text-white/40'}`}>
                                  {matchLabel[m.matchType] || m.matchType}
                                </span>
                              </div>
                              <span className="text-white font-bold text-sm">₹{m.prizeAmount?.toLocaleString()}</span>
                            </div>
                            {m.users?.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {m.users.map((u, i) => (
                                  <span key={i} className="text-xs bg-white/5 rounded-lg px-2 py-1 text-white/50">{u.name}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-white/20 text-xs">No winners in this tier</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 gap-3 border border-white/8 rounded-2xl">
                  <Dices size={32} className="text-white/10" />
                  <p className="text-white/30 text-sm">Configure and simulate a draw</p>
                  <p className="text-white/15 text-xs">Results preview will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Past draws */}
            {!drawsLoading && pastDraws.length > 0 && (
              <div className="mt-5">
                <div className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-3">Published Draws</div>
                <div className="space-y-2">
                  {pastDraws.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center gap-3 bg-white/2 border border-white/8 rounded-xl px-4 py-3">
                      <div className="flex-1">
                        <span className="text-white text-sm font-semibold">{MONTHS[d.month - 1]} {d.year}</span>
                        <span className="text-white/30 text-xs ml-2">
                          {d.winningNumbers?.join(', ')}
                        </span>
                      </div>
                      <Badge variant="green">Published</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish confirm */}
      <Modal open={publishConfirm} onClose={() => setPublishConfirm(false)} title="Publish Draw?" size="sm">
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-white/60 text-sm">
            This will officially publish the <strong className="text-white">{MONTHS[month - 1]} {year}</strong> draw, create winner records, and notify eligible users. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setPublishConfirm(false)}>Cancel</Button>
          <Button loading={publishing} className="flex-1" onClick={handlePublish}>
            <Send size={14} /> Confirm & Publish
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}