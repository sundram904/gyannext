import { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Mail, BookOpen, Loader2 } from 'lucide-react';
import { getAllTeachers, approveTeacher, rejectTeacher } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Primitives';

export default function TeacherApprovals() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllTeachers();
      setTeachers(data);
    } catch {
      setError('Could not load teachers. Check your Firestore rules & connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (teacher, decision) => {
    setBusy(teacher.id);
    try {
      if (decision === 'approved') await approveTeacher(teacher.id, user.uid);
      else await rejectTeacher(teacher.id, user.uid);
      setTeachers((ts) => ts.map((t) => (t.id === teacher.id ? { ...t, status: decision === 'approved' ? 'active' : 'rejected' } : t)));
    } catch {
      setError('Action failed — please try again.');
    } finally {
      setBusy(null);
    }
  };

  const pending = teachers.filter((t) => t.status === 'pending');
  const decided = teachers.filter((t) => t.status !== 'pending');

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <UserCheck size={22} className="text-primary" /> Teacher Approvals
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Approving here instantly unlocks that teacher's dashboard login. Rejecting blocks it.
      </p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400">
          <Loader2 size={18} className="animate-spin" /> Loading applications...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : (
        <>
          <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Pending ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No pending applications right now.</p>
          ) : (
            <div className="mt-3 space-y-4">
              {pending.map((t) => (
                <div key={t.id} className="flex flex-col gap-4 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-display font-semibold text-primary">
                      {(t.name || 'T').charAt(0)}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-ink-900 dark:text-white">{t.name}</p>
                      <p className="flex items-center gap-1 text-xs text-ink-400"><Mail size={12} /> {t.email}</p>
                      <p className="flex items-center gap-1 text-xs text-ink-400"><BookOpen size={12} /> {(t.subjects || []).join(', ') || 'No subjects listed'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button disabled={busy === t.id} onClick={() => decide(t, 'approved')} className="btn-primary !py-2 text-sm disabled:opacity-50">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button disabled={busy === t.id} onClick={() => decide(t, 'rejected')} className="btn-ghost !py-2 text-sm text-red-500 disabled:opacity-50">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {decided.length > 0 && (
            <>
              <h2 className="mt-10 text-xs font-semibold uppercase tracking-wide text-ink-400">Reviewed</h2>
              <div className="mt-3 divide-y divide-ink-100 dark:divide-white/10 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
                {decided.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-ink-400">{t.email}</p>
                    </div>
                    <Badge tone={t.status === 'active' ? 'green' : 'red'}>{t.status === 'active' ? 'Approved' : 'Rejected'}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
