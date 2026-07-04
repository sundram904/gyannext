import { useEffect, useState } from 'react';
import { Megaphone, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createAnnouncement, getAllDocs } from '../../firebase/firestore';

function formatTime(ts) {
  if (!ts?.toDate) return 'Just now';
  return ts.toDate().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Announcements() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllDocs('announcements');
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setList(data);
    } catch {
      setError('Could not load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setPosting(true);
    try {
      await createAnnouncement({ ...form, createdBy: user.uid });
      setForm({ title: '', body: '', audience: 'all' });
      load();
    } catch {
      setError('Could not post announcement. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <Megaphone size={22} className="text-primary" /> Announcements
      </h1>
      <p className="mt-1 text-sm text-ink-400">Broadcast updates — students and teachers see these on their Notifications page in real time.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field flex-1" placeholder="Announcement title..." />
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="input-field sm:w-48">
            <option value="all">Everyone</option>
            <option value="student">Students only</option>
            <option value="teacher">Teachers only</option>
          </select>
          <button type="submit" disabled={posting} className="btn-primary shrink-0 disabled:opacity-60">
            {posting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Post
          </button>
        </div>
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={2} className="input-field resize-none" placeholder="Optional details..." />
      </form>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> Loading...</div>
      ) : list.length === 0 ? (
        <p className="mt-8 text-sm text-ink-400">No announcements posted yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-ink-100 dark:divide-white/10 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
          {list.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-semibold text-ink-900 dark:text-white">{a.title}</p>
                {a.body && <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-100">{a.body}</p>}
                <p className="mt-1 text-xs text-ink-400">To: {a.audience === 'all' ? 'Everyone' : a.audience === 'student' ? 'Students' : 'Teachers'}</p>
              </div>
              <span className="shrink-0 text-xs text-ink-400">{formatTime(a.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
