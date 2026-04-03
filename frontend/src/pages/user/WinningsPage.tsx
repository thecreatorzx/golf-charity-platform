import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getDashboard, uploadWinnerProof } from '../../api/services';
import { Button, Card, Badge, Modal, EmptyState, Input } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';

interface Winner {
  id: string;
  matchType: string;
  prizeAmount: number;
  verificationStatus: string;
  paymentStatus: string;
  proofUrl?: string;
  draw: { month: number; year: number };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const matchLabel: Record<string, string> = {
  FIVE_MATCH: '5-Number Jackpot',
  FOUR_MATCH: '4-Number Match',
  THREE_MATCH: '3-Number Match',
};

export default function WinningsPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState<Winner | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchWinnings = () => {
    setLoading(true);
    getDashboard()
      .then((r: { data: { winnerRecords: any; }; }) => setWinners(r.data.winnerRecords || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWinnings(); }, []);

  
  const handleProofUpload = async () => {
    if (!proofUrl.trim()) { setError('Enter a valid URL.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await uploadWinnerProof(proofModal!.id, proofUrl);
      setProofModal(null);
      setProofUrl('');
      fetchWinnings();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const verificationBadge = (status: string) => {
    if (status === 'APPROVED') return <Badge variant="green"><CheckCircle size={10} className="mr-1" />Approved</Badge>;
    if (status === 'REJECTED') return <Badge variant="red"><XCircle size={10} className="mr-1" />Rejected</Badge>;
    return <Badge variant="yellow"><Clock size={10} className="mr-1" />Pending</Badge>;
  };

  const paymentBadge = (status: string) => {
    if (status === 'PAID') return <Badge variant="green">Paid</Badge>;
    return <Badge variant="gray">Pending</Badge>;
  };

  const total = winners.reduce((a, w) => a + (w.prizeAmount || 0), 0);
  const paid = winners.filter((w) => w.paymentStatus === 'PAID').reduce((a, w) => a + (w.prizeAmount || 0), 0);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">My Winnings</h1>
          <p className="text-white/40 text-sm mt-1">Track your prize wins and verification status</p>
        </div>

        {/* Summary */}
        {winners.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Won', value: `₹${total.toLocaleString()}` },
              { label: 'Paid Out', value: `₹${paid.toLocaleString()}`, color: 'text-emerald-400' },
              { label: 'Pending', value: `₹${(total - paid).toLocaleString()}`, color: 'text-yellow-400' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="p-4 text-center">
                <div className={`text-2xl font-black ${color || 'text-white'}`}>{value}</div>
                <div className="text-white/40 text-xs mt-1">{label}</div>
              </Card>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
          </div>
        ) : winners.length === 0 ? (
          <Card>
            <EmptyState icon={<Trophy />} title="No winnings yet" description="Enter monthly draws to have a chance at winning prizes." />
          </Card>
        ) : (
          <div className="space-y-3">
            {winners.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#C8F04D]/10 flex items-center justify-center">
                      <Trophy size={18} className="text-[#C8F04D]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-white text-sm">{matchLabel[w.matchType] || w.matchType}</span>
                        {verificationBadge(w.verificationStatus)}
                        {paymentBadge(w.paymentStatus)}
                      </div>
                      <div className="text-white/30 text-xs">
                        {MONTHS[w.draw.month - 1]} {w.draw.year} Draw
                        {w.proofUrl && <span className="ml-2 text-[#C8F04D]/60">· Proof submitted</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-black text-lg">₹{w.prizeAmount?.toLocaleString()}</div>
                      {w.verificationStatus === 'PENDING' && !w.proofUrl && (
                        <Button size="sm" variant="outline" className="mt-2"
                          onClick={() => { setProofModal(w); setProofUrl(''); setError(''); }}>
                          <Upload size={12} /> Upload Proof
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!proofModal} onClose={() => setProofModal(null)} title="Upload Winner Proof">
        <p className="text-white/50 text-sm mb-4">
          Submit a screenshot URL showing your scores from the golf platform to verify your win.
        </p>
        <div className="space-y-4">
          <Input
            label="Screenshot URL"
            type="url"
            placeholder="https://example.com/your-screenshot.png"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            error={error}
          />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setProofModal(null)}>Cancel</Button>
            <Button loading={submitting} className="flex-1" onClick={handleProofUpload}>
              <Upload size={14} /> Submit Proof
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}