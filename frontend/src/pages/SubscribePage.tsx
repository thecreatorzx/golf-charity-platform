import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Trophy } from 'lucide-react';
import { initiateSubscription, verifySubscription, mockActivateSubscription } from '../api/services';
import { Button, Card } from '../components/ui';

const features = [
  'Stableford score tracking (5 rolling)',
  'Monthly prize draw entry',
  'Charity contribution control',
  'Winner dashboard & proofs',
  'Draw results & history',
];

export default function SubscribePage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
const handleSubscribe = async () => {
  setLoading(true);
  setError('');
  try {
    // Step 1: Create order
    const res = await initiateSubscription({ plan });
    const { order, key } = res.data;  // ← backend sends "key" not "key_id"

    // Step 2: Open Razorpay checkout
    const options = {
      key,
      amount: order.amount,
      currency: order.currency,
      name: 'Golf Charity Platform',
      description: `${plan} Subscription`,
      order_id: order.id,
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // Step 3: Confirm payment
          await verifySubscription({
            plan,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          navigate('/dashboard');
        } catch {
          setError('Payment verification failed. Please contact support.');
          setLoading(false);
        }
      },
      theme: { color: '#C8F04D' },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
      setError('Payment failed. Please try again.');
      setLoading(false);
    });
    rzp.open();
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    setError(e?.response?.data?.message || 'Subscription failed. Please try again.');
    setLoading(false);
  }
};

const handleMockSubscribe = async () => {
  setLoading(true);
  setError('');
  try {
    await mockActivateSubscription({ plan });
    navigate('/dashboard');
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    setError(e?.response?.data?.message || 'Mock activation failed.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#080a0e] flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-[#C8F04D]/4 rounded-full blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#C8F04D]/10 border border-[#C8F04D]/20 rounded-full px-4 py-1.5 text-[#C8F04D] text-xs font-bold uppercase tracking-widest mb-5">
            <Zap size={12} /> Choose Your Plan
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Start Playing with Purpose</h1>
          <p className="text-white/40">Pick a plan and start entering monthly draws.</p>
        </div>

        <Card className="p-6" glow>
          {/* Plan selector */}
          <div className="flex gap-3 mb-6">
            {(['MONTHLY', 'YEARLY'] as const).map((p) => (
              <button key={p} onClick={() => setPlan(p)}
                className={`flex-1 rounded-xl border py-4 px-4 text-center transition-all ${plan === p ? 'bg-[#C8F04D]/10 border-[#C8F04D]/40 text-[#C8F04D]' : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
                <div className="font-black text-lg">{p === 'MONTHLY' ? '₹999' : '₹8,999'}</div>
                <div className="text-xs font-medium mt-0.5">{p === 'MONTHLY' ? 'per month' : 'per year'}</div>
                {p === 'YEARLY' && <div className="text-[10px] font-bold bg-[#C8F04D]/20 text-[#C8F04D] rounded-full px-2 py-0.5 mt-1 inline-block">Save 17%</div>}
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-5 h-5 rounded-full bg-[#C8F04D]/15 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-[#C8F04D]" />
                </div>
                {f}
              </div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-4 mb-6 py-4 border-y border-white/8">
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Shield size={13} /> PCI Compliant
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Trophy size={13} /> Monthly Draws
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Check size={13} /> Cancel Anytime
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">{error}</p>}

          <Button onClick={handleSubscribe} loading={loading} size="lg" className="w-full">
            Subscribe {plan === 'MONTHLY' ? '₹999/mo' : '₹8,999/yr'}          </Button>
          <p className="text-center text-white/20 text-xs mt-3">Powered by Razorpay · Secure Payment</p>

          {/* Mock activation for testing */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-center text-white/30 text-xs mb-3">⚡ Skip payment for testing</p>
            <Button onClick={handleMockSubscribe} loading={loading} size="lg" className="w-full bg-transparent border border-dashed border-white/20 text-white/40 hover:text-black">
              Mock Activate ({plan === 'MONTHLY' ? '₹999' : '₹8,999'})
            </Button>
          </div>
          <div className="mt-3">
            <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full bg-transparent border border-white/10 text-white/40 hover:text-black">
              ← Back to Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}