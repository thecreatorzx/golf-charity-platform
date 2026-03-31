import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ChevronDown, Shield, Target } from 'lucide-react';
import { adminGetUsers, adminUpdateUserSubscription } from '../../api/services';
import { Button, Input, Card, Badge, Modal, EmptyState } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription?: { status: string; plan: string; renewalDate?: string };
  scores?: { id: string; score: number; datePlayed: string }[];
  charityContribution?: { charity: { name: string }; percentage: number };
  createdAt: string;
}

const SUB_STATUSES = ['ACTIVE', 'INACTIVE', 'CANCELLED', 'LAPSED'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filtered, setFiltered] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailUser, setDetailUser] = useState<UserRecord | null>(null);
  const [subStatus, setSubStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    adminGetUsers()
      .then((r: { data: { users: any; }; }) => {
        const data = r.data.users || r.data;
        setUsers(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  }, [search, users]);

  const handleSubUpdate = async () => {
    if (!detailUser || !subStatus) return;
    setUpdating(true);
    setMsg('');
    try {
      await adminUpdateUserSubscription(detailUser.id, subStatus);
      setMsg('Subscription updated!');
      fetchUsers();
      setTimeout(() => {
        setMsg('');
        setDetailUser(null);
      }, 1500);
    } catch {
      setMsg('Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const subBadge = (status?: string) => {
    if (!status) return <Badge variant="gray">None</Badge>;
    if (status === 'ACTIVE') return <Badge variant="green">Active</Badge>;
    if (status === 'INACTIVE') return <Badge variant="red">Inactive</Badge>;
    return <Badge variant="yellow">{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">User Management</h1>
            <p className="text-white/40 text-sm mt-1">{users.length} registered users</p>
          </div>
        </div>

        <div className="mb-5">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Users />} title="No users found" />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {['User', 'Role', 'Subscription', 'Scores', 'Charity', 'Joined', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D] text-xs font-black shrink-0">
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-sm font-semibold">{u.name}</div>
                            <div className="text-white/30 text-xs">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.role === 'ADMIN' ? (
                          <Badge variant="yellow"><Shield size={10} className="mr-1" />Admin</Badge>
                        ) : (
                          <Badge variant="gray">User</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5">{subBadge(u.subscription?.status)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-white/60 text-sm">
                          <Target size={13} className="text-[#C8F04D]/60" />
                          {u.scores?.length || 0}/5
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-white/50 text-xs">
                          {u.charityContribution ? `${u.charityContribution.charity.name} (${u.charityContribution.percentage}%)` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/30 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <Button size="sm" variant="ghost"
                          onClick={() => { setDetailUser(u); setSubStatus(u.subscription?.status || 'INACTIVE'); setMsg(''); }}>
                          Manage <ChevronDown size={13} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* User detail modal */}
      <Modal open={!!detailUser} onClose={() => setDetailUser(null)} title={detailUser?.name} size="lg">
        {detailUser && (
          <div className="space-y-5">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Email', value: detailUser.email },
                { label: 'Role', value: detailUser.role },
                { label: 'Plan', value: detailUser.subscription?.plan || 'None' },
                { label: 'Joined', value: new Date(detailUser.createdAt).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl px-4 py-3">
                  <div className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-0.5">{label}</div>
                  <div className="text-white text-sm font-semibold">{value}</div>
                </div>
              ))}
            </div>

            {/* Scores */}
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Scores ({detailUser.scores?.length || 0}/5)</div>
              {detailUser.scores?.length ? (
                <div className="flex gap-2 flex-wrap">
                  {detailUser.scores.map((s) => (
                    <div key={s.id} className="bg-white/5 rounded-lg px-3 py-2 text-center min-w-15">
                      <div className="text-[#C8F04D] font-black">{s.score}</div>
                      <div className="text-white/30 text-[10px]">{new Date(s.datePlayed).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-white/30 text-sm">No scores</p>}
            </div>

            {/* Charity */}
            {detailUser.charityContribution && (
              <div className="bg-white/5 rounded-xl px-4 py-3">
                <div className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-1">Charity</div>
                <div className="text-white text-sm font-semibold">
                  {detailUser.charityContribution.charity.name} · {detailUser.charityContribution.percentage}%
                </div>
              </div>
            )}

            {/* Update subscription */}
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Update Subscription Status</div>
              <div className="flex gap-2 flex-wrap">
                {SUB_STATUSES.map((s) => (
                  <button key={s} onClick={() => setSubStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${subStatus === s ? 'bg-[#C8F04D]/10 border-[#C8F04D]/40 text-[#C8F04D]' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {msg && <p className={`text-sm font-semibold ${msg.includes('failed') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>}

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setDetailUser(null)}>Close</Button>
              <Button loading={updating} className="flex-1" onClick={handleSubUpdate}>Update Subscription</Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}