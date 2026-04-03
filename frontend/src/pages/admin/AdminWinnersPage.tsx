import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, XCircle, Clock, DollarSign, ExternalLink } from 'lucide-react';
import { adminGetWinners, adminVerifyWinner, adminMarkWinnerPaid } from '../../api/services';
import { Button, Card, Badge, EmptyState, Modal } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';

interface Winner {
  id: string;
  matchType: string;
  prizeAmount: number;

  user?: {
    id: string;
    name: string;
    email: string;
  };

  winner?: {
    proofUrl?: string;
    verificationStatus: string;
    paymentStatus: string;
  };

  draw?: {
    month: number;
    year: number;
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const matchLabel: Record<string, string> = {
  FIVE_MATCH: '5-Match Jackpot',
  FOUR_MATCH: '4-Match',
  THREE_MATCH: '3-Match',
};

const matchColor: Record<string, string> = {
  FIVE_MATCH: 'text-[#C8F04D]',
  FOUR_MATCH: 'text-blue-400',
  THREE_MATCH: 'text-orange-400',
};

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [actionWinner, setActionWinner] = useState<Winner | null>(null);
  const [confirming, setConfirming] = useState(false);

  const fetchWinners = () => {
    setLoading(true);
    adminGetWinners()
      .then((r: any) => {
        const data = r.data;
        setWinners(Array.isArray(data) ? data : data?.winners || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const filtered = winners.filter((w) => {
    if (filter === 'ALL') return true;
    return w.winner?.verificationStatus === filter;
  });

  const handleVerify = async (status: 'APPROVED' | 'REJECTED') => {
    if (!actionWinner) return;

    setConfirming(true);
    try {
      await adminVerifyWinner(actionWinner.id, status);
      setActionWinner(null);
      fetchWinners();
    } finally {
      setConfirming(false);
    }
  };

  const handlePay = async (winnerId: string) => {
    const winner = winners.find(w => w.id === winnerId);

    if (!winner) return;
    if (winner.winner?.paymentStatus === 'PAID') return;
    if (winner.winner?.verificationStatus !== 'APPROVED') return;

    try {
      await adminMarkWinnerPaid(winnerId);
      fetchWinners();
    } catch {}
  };

  const verBadge = (status?: string) => {
    if (status === 'APPROVED')
      return (
        <Badge variant="green">
          <CheckCircle size={10} className="mr-1" />
          Approved
        </Badge>
      );

    if (status === 'REJECTED')
      return (
        <Badge variant="red">
          <XCircle size={10} className="mr-1" />
          Rejected
        </Badge>
      );

    return (
      <Badge variant="yellow">
        <Clock size={10} className="mr-1" />
        Pending
      </Badge>
    );
  };

  const payBadge = (status?: string) => {
    if (status === 'PAID') return <Badge variant="green">Paid</Badge>;
    return <Badge variant="gray">Unpaid</Badge>;
  };

  const counts = useMemo(
    () => ({
      ALL: winners.length,
      PENDING: winners.filter(w => w.winner?.verificationStatus === 'PENDING').length,
      APPROVED: winners.filter(w => w.winner?.verificationStatus === 'APPROVED').length,
      REJECTED: winners.filter(w => w.winner?.verificationStatus === 'REJECTED').length,
    }),
    [winners]
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Winners Management</h1>
            <p className="text-white/40 text-sm mt-1">
              Verify submissions and manage payouts
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-[#C8F04D]/10 text-[#C8F04D] border border-[#C8F04D]/30'
                  : 'text-white/40 border border-white/8 hover:border-white/15'
              }`}
            >
              {f}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === f
                    ? 'bg-[#C8F04D]/20 text-[#C8F04D]'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Trophy />} title={`No ${filter.toLowerCase()} winners`} />
        ) : (
          <div className="space-y-3">
            {filtered.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-5">
                  <div className="flex items-center gap-4 flex-wrap">

                    {/* User */}
                    <div className="flex items-center gap-3 min-w-45">
                      <div className="w-9 h-9 rounded-full bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D] font-black text-sm">
                        {w.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">
                          {w.user?.name || 'Unknown'}
                        </div>
                        <div className="text-white/30 text-xs">
                          {w.user?.email || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Draw */}
                    <div className="min-w-25">
                      <div className="text-white/50 text-xs">Draw</div>
                      <div className="text-white text-sm font-semibold">
                        {w.draw?.month
                          ? `${MONTHS[w.draw.month - 1]} ${w.draw.year}`
                          : 'N/A'}
                      </div>
                    </div>

                    {/* Match */}
                    <div className="min-w-30">
                      <div className="text-white/50 text-xs">Match</div>
                      <div className={`text-sm font-bold ${matchColor[w.matchType] || 'text-white/60'}`}>
                        {matchLabel[w.matchType] || w.matchType}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="min-w-20">
                      <div className="text-white/50 text-xs">Prize</div>
                      <div className="text-white font-black">
                        ₹{w.prizeAmount?.toLocaleString()}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex gap-2 flex-wrap">
                      {verBadge(w.winner?.verificationStatus)}
                      {payBadge(w.winner?.paymentStatus)}
                    </div>

                    {/* Actions */}
                    <div className="ml-auto flex items-center gap-2 flex-wrap">
                      {w.winner?.proofUrl && (
                        <a
                          href={w.winner.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60"
                        >
                          <ExternalLink size={12} /> Proof
                        </a>
                      )}

                      {w.winner?.verificationStatus === 'PENDING' && (
                        <Button size="sm" variant="secondary" onClick={() => setActionWinner(w)}>
                          Review
                        </Button>
                      )}

                      {w.winner?.verificationStatus === 'APPROVED' &&
                        w.winner?.paymentStatus !== 'PAID' && (
                          <Button size="sm" onClick={() => handlePay(w.id)}>
                            <DollarSign size={12} /> Mark Paid
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

      {/* Modal */}
      <Modal
        open={!!actionWinner}
        onClose={() => setActionWinner(null)}
        title="Review Winner Submission"
        size="md"
      >
        {actionWinner && (
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Winner', value: actionWinner.user?.name },
                { label: 'Email', value: actionWinner.user?.email },
                {
                  label: 'Draw',
                  value: actionWinner.draw?.month
                    ? `${MONTHS[actionWinner.draw.month - 1]} ${actionWinner.draw.year}`
                    : 'N/A',
                },
                {
                  label: 'Match Type',
                  value: matchLabel[actionWinner.matchType],
                },
                {
                  label: 'Prize Amount',
                  value: `₹${actionWinner.prizeAmount?.toLocaleString()}`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl px-4 py-3">
                  <div className="text-white/30 text-xs uppercase">{label}</div>
                  <div className="text-white text-sm font-semibold">{value}</div>
                </div>
              ))}
            </div>

            {actionWinner.winner?.proofUrl ? (
              <a
                href={actionWinner.winner.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C8F04D] text-sm break-all"
              >
                {actionWinner.winner.proofUrl}
              </a>
            ) : (
              <div className="text-yellow-400 text-sm">
                No proof submitted
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setActionWinner(null)}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                loading={confirming}
                className="flex-1"
                onClick={() => handleVerify('REJECTED')}
              >
                <XCircle size={14} /> Reject
              </Button>

              <Button
                loading={confirming}
                className="flex-1"
                onClick={() => handleVerify('APPROVED')}
              >
                <CheckCircle size={14} /> Approve
              </Button>
            </div>

          </div>
        )}
      </Modal>
    </AppLayout>
  );
}