import { useEffect, useState } from 'react';
import { ClipboardCheck, Upload, FileText, Type, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/Primitives';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentEnrollments, getAssignmentsForCourses, getStudentSubmissions, submitAssignment,
} from '../../firebase/firestore';

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [active, setActive] = useState(null);
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const enrollments = await getStudentEnrollments(user.uid);
      const courseIds = enrollments.map((e) => e.courseId);
      const [assignmentData, submissionData] = await Promise.all([
        getAssignmentsForCourses(courseIds),
        getStudentSubmissions(user.uid),
      ]);
      setAssignments(assignmentData);
      setSubmissions(submissionData);
    } catch {
      setError('Could not load assignments right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const submissionFor = (assignmentId) => submissions.find((s) => s.assignmentId === assignmentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Production: upload `file` to Firebase Storage first and pass its download URL as fileUrl.
      await submitAssignment({
        assignmentId: active.id,
        courseId: active.courseId,
        studentId: user.uid,
        text: mode === 'text' ? text : null,
        fileUrl: mode === 'file' && file ? file.name : null,
      });
      setActive(null);
      setText('');
      setFile(null);
      load();
    } catch {
      setError('Could not submit — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Assignments</h1>
      <p className="mt-1 text-sm text-ink-400">Real assignments from your enrolled courses — submit as text, image, or PDF.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400">
          <Loader2 size={18} className="animate-spin" /> Loading assignments...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : assignments.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          No assignments yet. Once a teacher posts one for a course you're enrolled in, it'll show up here.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {assignments.map((a) => {
            const sub = submissionFor(a.id);
            return (
              <div key={a.id} className="flex flex-col gap-4 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ClipboardCheck size={18} />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-ink-400">{a.courseTitle}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-400"><Clock size={12} /> Due {a.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {sub?.grade && <Badge tone="green">Grade: {sub.grade}</Badge>}
                  {sub ? (
                    <Badge tone="green"><CheckCircle2 size={12} className="inline mr-1" />Submitted</Badge>
                  ) : (
                    <button onClick={() => setActive(a)} className="btn-primary text-sm">Submit</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-ink-900 p-6 shadow-xl">
            <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{active.title}</h3>
            <div className="mt-4 flex gap-2">
              {[{ key: 'text', icon: Type, label: 'Text' }, { key: 'file', icon: Upload, label: 'Image / PDF' }].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium ${
                    mode === m.key ? 'border-primary bg-primary/10 text-primary' : 'border-ink-100 dark:border-white/10 text-ink-500 dark:text-ink-100'
                  }`}
                >
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              {mode === 'text' ? (
                <textarea required value={text} onChange={(e) => setText(e.target.value)} rows={5} className="input-field resize-none" placeholder="Type your answer..." />
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-200 dark:border-white/10 p-8 text-center">
                  <FileText size={26} className="text-ink-400" />
                  <span className="text-xs text-ink-500 dark:text-ink-100">{file ? file.name : 'Click to upload image or PDF'}</span>
                  <input required type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              )}
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => setActive(null)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
