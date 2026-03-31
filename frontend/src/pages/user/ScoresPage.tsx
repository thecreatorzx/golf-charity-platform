import { useEffect, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Calendar, Info } from 'lucide-react';
import { getScores, addScore, deleteScore } from '../../api/services';
import { Button, Input, Card, Badge, Modal, EmptyState } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';
import { AnimatePresence as AP } from 'framer-motion';

interface Score {
  id: string;
  score: number;
  datePlayed: string;
  createdAt: string;
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [form, setForm] = useState({ score: '', datePlayed: new Date().toISOString().split('T')[0] });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchScores = () => {
    setLoading(true);
    getScores()
      .then((r: { data: { scores: any; }; }) => setScores(r.data.scores || r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchScores(); }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const s = Number(form.score);
    if (s < 1 || s > 45) { setFormError('Score must be between 1 and 45.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      await addScore({ score: s, datePlayed: form.datePlayed });
      setAddOpen(false);
      setForm({ score: '', datePlayed: new Date().toISOString().split('T')[0] });
      fetchScores();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e?.response?.data?.message || 'Failed to add score');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScore(id);
      setDelId(null);
      fetchScores();
    } catch {
      // handle
    }
  };

  const scoreColor = (s: number) => {
    if (s >= 36) return 'text-emerald-400';
    if (s >= 25) return 'text-[#C8F04D]';
    if (s >= 15) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const scoreLabel = (s: number) => {
    if (s >= 36) return 'Excellent';
    if (s >= 25) return 'Good';
    if (s >= 15) return 'Average';
    return 'Developing';
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">My Scores</h1>
            <p className="text-white/40 text-sm mt-1">Track your last 5 Stableford rounds</p>
          </div>
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus size={15} /> Add Score
          </Button>
        </div>

        {/* Rolling window info */}
        <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-blue-400/80 text-sm">
            Only your <strong>5 most recent</strong> scores are retained. Adding a 6th score automatically removes the oldest. Score range: <strong>1–45</strong> (Stableford).
          </p>
        </div>

        {/* Score slots */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
          </div>
        ) : scores.length === 0 ? (
          <Card>
            <EmptyState icon={<Target />} title="No scores yet" description="Add your first Stableford score to participate in monthly draws." />
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {scores.map((s, i) => (
                <motion.div key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}>
                  <Card className="p-5 flex items-center gap-4 group hover:border-white/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 font-black text-sm">
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-black ${scoreColor(s.score)}`}>{s.score}</span>
                        <span className="text-white/30 text-sm">points</span>
                        <Badge variant={s.score >= 25 ? 'green' : s.score >= 15 ? 'yellow' : 'gray'}>{scoreLabel(s.score)}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-white/30 text-xs mt-0.5">
                        <Calendar size={11} /> {new Date(s.datePlayed).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    {/* Score bar */}
                    <div className="hidden sm:flex flex-col items-end gap-1 min-w-[80px]">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.score >= 25 ? 'bg-[#C8F04D]' : 'bg-orange-400'}`} style={{ width: `${(s.score / 45) * 100}%` }} />
                      </div>
                      <span className="text-white/20 text-xs">{Math.round((s.score / 45) * 100)}%</span>
                    </div>
                    <button
                      onClick={() => setDelId(s.id)}
                      className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Remaining slots indicator */}
        {scores.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < scores.length ? 'bg-[#C8F04D]' : 'bg-white/10'}`} />
            ))}
            <span className="text-white/30 text-xs ml-2">{scores.length}/5</span>
          </div>
        )}
      </div>

      {/* Add Score Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Stableford Score">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Stableford Points (1–45)"
            type="number"
            min={1} max={45}
            placeholder="Enter your score"
            value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
            icon={<Target size={15} />}
            error={formError}
            required
          />
          <Input
            label="Date Played"
            type="date"
            value={form.datePlayed}
            onChange={(e) => setForm({ ...form, datePlayed: e.target.value })}
            icon={<Calendar size={15} />}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">Add Score</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm delete */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete Score?" size="sm">
        <p className="text-white/60 text-sm mb-5">This will permanently remove this score from your record.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDelId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => delId && handleDelete(delId)}>Delete</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}