import { useEffect, useState } from 'react';
import { Bell, Megaphone, Loader2 } from 'lucide-react';
import { getAllDocs } from '../../firebase/firestore';

function formatTime(ts) {
  if (!ts?.toDate) return 'Just now';
  return ts.toDate().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Notifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const all = await getAllDocs('announcements');
        const relevant = all
          .filter((a) => a.audience === 'all' || a.audience === 'student')
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setList(relevant);
      } catch {
        setError('Could not load notifications right now.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <Bell size={22} className="text-primary" /> Notifications
      </h1>
      <p className="mt-1 text-sm text-ink-400">Announcements posted by GyanNext admins, in real time.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading...</div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : list.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">No announcements yet — check back soon.</div>
      ) : (
        <div className="mt-6 divide-y divide-ink-100 dark:divide-white/10 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
          {list.map((n) => (
            <div key={n.id} className="flex items-start gap-4 p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Megaphone size={17} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">{n.title}</p>
                {n.body && <p className="text-xs text-ink-400">{n.body}</p>}
              </div>
              <span className="shrink-0 text-xs text-ink-400">{formatTime(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
