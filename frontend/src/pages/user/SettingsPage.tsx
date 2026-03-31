import { useState, FormEvent, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, CreditCard, AlertTriangle } from 'lucide-react';
import { updateProfile, cancelSubscription, getSubscriptionStatus } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card, Modal } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';
import { useEffect } from 'react';

interface SubStatus {
  status: string;
  plan?: string;
  renewalDate?: string;
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [sub, setSub] = useState<SubStatus | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getSubscriptionStatus()
      .then((r: { data: SetStateAction<SubStatus | null>; }) => setSub(r.data))
      .catch(() => setSub(null));
  }, []);

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(''); setProfileMsg('');
    setProfileLoading(true);
    try {
      const res = await updateProfile({ name });
      setUser(res.data.user);
      setProfileMsg('Profile updated successfully!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setProfileError(e?.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPassError(''); setPassMsg('');
    if (newPassword.length < 8) { setPassError('New password must be at least 8 characters.'); return; }
    setPassLoading(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setPassMsg('Password updated successfully!');
      setCurrentPassword(''); setNewPassword('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setPassError(e?.response?.data?.message || 'Password update failed');
    } finally {
      setPassLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      setSub((prev) => prev ? { ...prev, status: 'INACTIVE' } : null);
      setCancelOpen(false);
    } catch {
      // handle
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Manage your account and subscription</p>
        </div>

        <div className="space-y-5">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D]">
                  <User size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Profile</div>
                  <div className="text-white/30 text-xs">Update your display name</div>
                </div>
              </div>
              <form onSubmit={handleProfile} className="space-y-4">
                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                <div className="flex items-center gap-3">
                  <Input label="Email" value={user?.email || ''} disabled className="flex-1 opacity-50 cursor-not-allowed" />
                </div>
                {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
                {profileMsg && <p className="text-emerald-400 text-sm">{profileMsg}</p>}
                <Button type="submit" size="sm" loading={profileLoading}>Save Changes</Button>
              </form>
            </Card>
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Lock size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Password</div>
                  <div className="text-white/30 text-xs">Change your account password</div>
                </div>
              </div>
              <form onSubmit={handlePassword} className="space-y-4">
                <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" required />
                <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" required />
                {passError && <p className="text-red-400 text-sm">{passError}</p>}
                {passMsg && <p className="text-emerald-400 text-sm">{passMsg}</p>}
                <Button type="submit" size="sm" loading={passLoading} variant="secondary">Update Password</Button>
              </form>
            </Card>
          </motion.div>

          {/* Subscription */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D]">
                  <CreditCard size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Subscription</div>
                  <div className="text-white/30 text-xs">Manage your plan</div>
                </div>
              </div>
              {sub ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/8">
                    <span className="text-white/50 text-sm">Status</span>
                    <span className={`font-bold text-sm ${sub.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>{sub.status}</span>
                  </div>
                  {sub.plan && (
                    <div className="flex items-center justify-between py-3 border-b border-white/8">
                      <span className="text-white/50 text-sm">Plan</span>
                      <span className="font-bold text-white text-sm">{sub.plan}</span>
                    </div>
                  )}
                  {sub.renewalDate && (
                    <div className="flex items-center justify-between py-3 border-b border-white/8">
                      <span className="text-white/50 text-sm">Renewal Date</span>
                      <span className="text-white/70 text-sm">{new Date(sub.renewalDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {sub.status === 'ACTIVE' && (
                    <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No active subscription.</p>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Subscription?" size="sm">
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-white/60 text-sm">You'll lose access to draws, score tracking, and all platform features at the end of your billing period.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setCancelOpen(false)}>Keep Subscription</Button>
          <Button variant="danger" loading={cancelling} className="flex-1" onClick={handleCancel}>Yes, Cancel</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}