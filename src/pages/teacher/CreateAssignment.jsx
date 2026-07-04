import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import { ALL_COURSES } from '../../data/courses';
import { useAuth } from '../../context/AuthContext';
import {
  createAssignment, getAssignmentsByTeacher, getSubmissionsForAssignments,
} from '../../firebase/firestore';

export default function CreateAssignment() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ title: '', courseId: ALL_COURSES[0]?.id || '', due: '', description: '' });
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [submissionCounts, setSubmissionCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAssignmentsByTeacher(user.uid);
      setAssignments(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      const subs = await getSubmissionsForAssignments(data.map((a) => a.id));
      const counts = {};
      subs.forEach((s) => { counts[s.assignmentId] = (counts[s.assignmentId] || 0) + 1; });
      setSubmissionCounts(counts);
    } catch {
      setError('Could not load your assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const course = ALL_COURSES.find((c) => c.id === form.courseId);
      await createAssignment({
        teacherId: user.uid,
        teacherName: profile?.name || 'Teacher',
        courseId: form.courseId,
        courseTitle: course?.title || '',
        title: form.title,
        description: form.description,
        dueDate: form.due,
      });
      setCreated(true);
      setTimeout(() => setCreated(false), 2500);
      setForm({ title: '', courseId: ALL_COURSES[0]?.id || '', due: '', description: '' });
      load();
    } catch {
      setError('Could not publish assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <ClipboardCheck size={22} className="text-primary" /> Assignments
      </h1>
      <p className="mt-1 text-sm text-ink-400">Create assignments — they appear instantly for every student enrolled in the selected course.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">New Assignment</h3>
          {created && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-600">
              <CheckCircle2 size={16} /> Assignment published.
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <div className="mt-4 space-y-4">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Assignment title" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="input-field">
                {ALL_COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input required type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="input-field" />
            </div>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input-field resize-none" placeholder="Instructions for students..." />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary mt-5 disabled:opacity-60">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {submitting ? 'Publishing...' : 'Publish Assignment'}
          </button>
        </form>

        <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Your Assignments</h3>
          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : assignments.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">You haven't published any assignments yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-ink-100 dark:divide-white/10">
              {assignments.map((a) => (
                <div key={a.id} className="py-3.5">
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-ink-400">{a.courseTitle} · Due {a.dueDate}</p>
                  <p className="mt-1 text-xs font-medium text-primary">{submissionCounts[a.id] || 0} submission(s)</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
