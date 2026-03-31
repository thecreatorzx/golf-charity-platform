import { useEffect, useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Edit2, Trash2, Star, Globe } from 'lucide-react';
import { getCharities, adminAddCharity, adminEditCharity, adminDeleteCharity } from '../../api/services';
import { Button, Input, Card, Badge, Modal, EmptyState } from '../../components/ui';
import AppLayout from '../../components/layout/AppLayout';

interface Charity {
  id: string;
  name: string;
  description: string;
  website?: string;
  featured: boolean;
}

interface CharityForm {
  name: string;
  description: string;
  website: string;
  featured: boolean;
}

const emptyForm: CharityForm = { name: '', description: '', website: '', featured: false };

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Charity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Charity | null>(null);
  const [form, setForm] = useState<CharityForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCharities = () => {
    setLoading(true);
    getCharities()
      .then((r: { data: { charities: any; }; }) => setCharities(r.data.charities || r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCharities(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (c: Charity) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description, website: c.website || '', featured: c.featured });
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setFormError('Name and description are required.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const payload = { ...form, website: form.website || undefined };
      if (editing) {
        await adminEditCharity(editing.id, payload);
      } else {
        await adminAddCharity(payload);
      }
      setFormOpen(false);
      fetchCharities();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e?.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteCharity(deleteTarget.id);
      setDeleteTarget(null);
      fetchCharities();
    } catch {
      // handle
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Charity Management</h1>
            <p className="text-white/40 text-sm mt-1">{charities.length} charities listed</p>
          </div>
          <Button onClick={openAdd} size="sm">
            <Plus size={15} /> Add Charity
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8F04D]/20 border-t-[#C8F04D] animate-spin" />
          </div>
        ) : charities.length === 0 ? (
          <EmptyState icon={<Heart />} title="No charities yet" description="Add your first charity to get started." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {charities.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5 flex flex-col h-full hover:border-white/20 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2 flex-wrap">
                      {c.featured && (
                        <Badge variant="yellow">
                          <Star size={10} className="mr-1" fill="currentColor" /> Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C8F04D]/10 flex items-center justify-center text-[#C8F04D] shrink-0">
                      <Heart size={18} />
                    </div>
                    <h3 className="font-bold text-white">{c.name}</h3>
                  </div>

                  <p className="text-white/40 text-sm flex-1 leading-relaxed mb-4">{c.description}</p>

                  <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/8">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors">
                        <Globe size={12} /> {c.website.replace(/^https?:\/\//, '').slice(0, 30)}
                      </a>
                    ) : (
                      <span className="text-white/20 text-xs">No website</span>
                    )}
                    <div className="ml-auto flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                        <Edit2 size={12} /> Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? `Edit ${editing.name}` : 'Add Charity'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Charity Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Green Earth Foundation"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the charity and its mission..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#C8F04D]/60 transition-all resize-none"
              required
            />
          </div>
          <Input
            label="Website URL (optional)"
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://charity.org"
            icon={<Globe size={14} />}
          />
          <div className="flex items-center gap-3 py-3 px-4 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => setForm({ ...form, featured: !form.featured })}
              className={`w-10 h-5 rounded-full transition-all relative ${form.featured ? 'bg-[#C8F04D]' : 'bg-white/10'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.featured ? 'left-5' : 'left-0.5'}`} />
            </button>
            <div>
              <div className="text-white text-sm font-semibold">Featured Charity</div>
              <div className="text-white/30 text-xs">Highlighted on the homepage</div>
            </div>
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">
              {editing ? 'Save Changes' : 'Add Charity'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Charity?" size="sm">
        <p className="text-white/60 text-sm mb-1">
          Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>?
        </p>
        <p className="text-white/30 text-xs mb-5">Users who selected this charity will lose their association.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} className="flex-1" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}