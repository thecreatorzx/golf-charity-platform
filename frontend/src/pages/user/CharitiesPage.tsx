import { useEffect, useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, ExternalLink, Check, Star } from 'lucide-react';
import { getCharities, selectCharity, getUserCharity, donate } from '../../api/services';
import { Button, Input, Card, Badge, Modal, EmptyState } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';

interface Charity {
  id: string;
  name: string;
  description: string;
  website?: string;
  featured: boolean;
}

interface UserCharity {
  charity: Charity;
  percentage: number;
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [userCharity, setUserCharity] = useState<UserCharity | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectModal, setSelectModal] = useState<Charity | null>(null);
  const [donateModal, setDonateModal] = useState<Charity | null>(null);
  const [percentage, setPercentage] = useState('10');
  const [donateAmount, setDonateAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [charitiesRes, userRes] = await Promise.allSettled([
        getCharities({ search: search || undefined }),
        getUserCharity(),
      ]);
      if (charitiesRes.status === 'fulfilled') setCharities(charitiesRes.value.data.charities || charitiesRes.value.data);
      if (userRes.status === 'fulfilled') setUserCharity(userRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      getCharities({ search: search || undefined }).then((r: { data: { charities: any; }; }) => setCharities(r.data.charities || r.data));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSelect = async (e: FormEvent) => {
    e.preventDefault();
    const p = Number(percentage);
    if (p < 10) { setFormError('Minimum contribution is 10%.'); return; }
    if (p > 100) { setFormError('Cannot exceed 100%.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      await selectCharity({ charityId: selectModal!.id, percentage: p });
      await fetchData();
      setSelectModal(null);
      setSuccess('Charity selected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e?.response?.data?.message || 'Failed to select charity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDonate = async (e: FormEvent) => {
    e.preventDefault();
    const a = Number(donateAmount);
    if (!a || a <= 0) { setFormError('Enter a valid amount.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      await donate({ charityId: donateModal!.id, amount: a });
      setDonateModal(null);
      setDonateAmount('');
      setSuccess('Donation successful! Thank you.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e?.response?.data?.message || 'Donation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Charities</h1>
          <p className="text-white/40 text-sm mt-1">Choose a charity to support with your subscription</p>
        </div>

        {/* Current charity */}
        {userCharity && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-linear-to-r from-[#C8F04D]/10 to-transparent border border-[#C8F04D]/20 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#C8F04D]/20 flex items-center justify-center">
                <Heart size={18} className="text-[#C8F04D]" fill="currentColor" />
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-0.5">Currently Supporting</div>
                <div className="font-bold text-white">{userCharity?.charity?.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#C8F04D]">{userCharity.percentage}%</div>
              <div className="text-white/30 text-xs">of subscription</div>
            </div>
          </motion.div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm font-semibold">{success}</div>
        )}

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
          </div>
        ) : charities.length === 0 ? (
          <EmptyState icon={<Heart />} title="No charities found" description="Try a different search term." />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {charities.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`p-5 h-full flex flex-col hover:border-white/20 transition-colors ${userCharity?.charity.id === c.id ? 'border-[#C8F04D]/30 bg-[#C8F04D]/5' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {c.featured && <Badge variant="yellow"><Star size={10} className="mr-1" />Featured</Badge>}
                      {userCharity?.charity.id === c.id && <Badge variant="green"><Check size={10} className="mr-1" />Selected</Badge>}
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-2">{c.name}</h3>
                  <p className="text-white/40 text-sm flex-1 leading-relaxed mb-4">{c.description}</p>
                  <div className="flex gap-2 mt-auto">
                    <Button size="sm" variant={userCharity?.charity.id === c.id ? 'outline' : 'secondary'} className="flex-1"
                      onClick={() => { setSelectModal(c); setPercentage(userCharity?.percentage.toString() || '10'); setFormError(''); }}>
                      {userCharity?.charity.id === c.id ? 'Change %' : 'Select'}
                    </Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => { setDonateModal(c); setDonateAmount(''); setFormError(''); }}>
                      <Heart size={13} /> Donate
                    </Button>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors flex items-center">
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Select charity modal */}
      <Modal open={!!selectModal} onClose={() => setSelectModal(null)} title={`Support ${selectModal?.name}`}>
        <form onSubmit={handleSelect} className="space-y-4">
          <p className="text-white/50 text-sm">Set the percentage of your subscription that goes to this charity. Minimum 10%.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Contribution Percentage</label>
            <div className="relative">
              <input
                type="range" min={10} max={100} step={1}
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="w-full accent-[#C8F04D]"
              />
              <div className="flex justify-between text-white/30 text-xs mt-1">
                <span>10% (min)</span>
                <span className="text-[#C8F04D] font-black text-lg">{percentage}%</span>
                <span>100%</span>
              </div>
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setSelectModal(null)}>Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">Confirm Selection</Button>
          </div>
        </form>
      </Modal>

      {/* Donate modal */}
      <Modal open={!!donateModal} onClose={() => setDonateModal(null)} title={`Donate to ${donateModal?.name}`}>
        <form onSubmit={handleDonate} className="space-y-4">
          <p className="text-white/50 text-sm">Make an independent donation not tied to your subscription.</p>
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="Enter amount"
            min={1}
            value={donateAmount}
            onChange={(e) => setDonateAmount(e.target.value)}
            error={formError}
            required
          />
          <div className="flex gap-2">
            {[100, 250, 500, 1000].map((a) => (
              <button key={a} type="button" onClick={() => setDonateAmount(String(a))}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/50 hover:border-[#C8F04D]/40 hover:text-[#C8F04D] transition-colors">
                ₹{a}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setDonateModal(null)}>Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">
              <Heart size={14} /> Donate
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}