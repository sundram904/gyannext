import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, Save } from 'lucide-react';

export default function Profile() {
  const { profile, user } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || '', phone: profile?.phone || '',
    parentName: profile?.parentName || '', parentPhone: profile?.parentPhone || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Production: updateDoc(doc(db, 'users', user.uid), form)
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Profile</h1>
      <p className="mt-1 text-sm text-ink-400">Manage your personal details.</p>

      <div className="mt-6 max-w-xl rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-gradient font-display text-2xl font-bold text-white">
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white dark:bg-ink-900 shadow-card text-ink-500">
              <Camera size={13} />
            </button>
          </div>
          <div>
            <p className="font-display font-semibold text-ink-900 dark:text-white">{profile?.name}</p>
            <p className="text-sm text-ink-400">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {profile?.role === 'teacher' ? 'Teacher' : 'Student'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Parent Name</label>
            <input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Parent Phone</label>
            <input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            {saved && <p className="mb-3 text-sm font-medium text-emerald-500">Profile updated successfully.</p>}
            <button type="submit" className="btn-primary"><Save size={16} /> Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
