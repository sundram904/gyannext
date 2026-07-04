import { useEffect, useState } from 'react';
import { FileText, Star, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAssignmentsByTeacher, getSubmissionsForAssignments, getUsersByIds, gradeSubmission,
} from '../../firebase/firestore';

export default function Submissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [assignmentsById, setAssignmentsById] = useState({});
  const [studentsById, setStudentsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState({});
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState({});

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const assignments = await getAssignmentsByTeacher(user.uid);
      const aMap = {};
      assignments.forEach((a) => { aMap[a.id] = a; });
      setAssignmentsById(aMap);

      const subs = await getSubmissionsForAssignments(assignments.map((a) => a.id));
      setSubmissions(subs);

      const students = await getUsersByIds(subs.map((s) => s.studentId));
      setStudentsById(students);
    } catch {
      setError('Could not load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const save = async (sub) => {
    setSaving(sub.id);
    try {
      await gradeSubmission(sub.id, grades[sub.id] || sub.grade || '', feedback[sub.id] || sub.feedback || '');
      setSaved((s) => ({ ...s, [sub.id]: true }));
    } catch {
      setError('Could not save grade — please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Homework & Grading</h1>
      <p className="mt-1 text-sm text-ink-400">Review submissions from your students and give marks with feedback.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400">
          <Loader2 size={18} className="animate-spin" /> Loading submissions...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : submissions.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          No submissions yet for your assignments.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {submissions.map((s) => {
            const a = assignmentsById[s.assignmentId];
            const student = studentsById[s.studentId];
            return (
              <div key={s.id} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold text-ink-900 dark:text-white">{student?.name || 'Student'}</p>
                    <p className="text-xs text-ink-400">{a?.title || 'Assignment'}</p>
                  </div>
                  {s.fileUrl ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary"><FileText size={14} /> {s.fileUrl}</span>
                  ) : (
                    <span className="max-w-xs truncate text-xs text-ink-400">"{s.text}"</span>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    placeholder="Marks (e.g. 18/20)"
                    defaultValue={s.grade || ''}
                    onChange={(e) => setGrades((g) => ({ ...g, [s.id]: e.target.value }))}
                    className="input-field sm:w-40"
                  />
                  <input
                    placeholder="Feedback for student..."
                    defaultValue={s.feedback || ''}
                    onChange={(e) => setFeedback((f) => ({ ...f, [s.id]: e.target.value }))}
                    className="input-field flex-1"
                  />
                  <button onClick={() => save(s)} disabled={saving === s.id} className="btn-primary shrink-0 !py-2.5 text-sm disabled:opacity-60">
                    {saving === s.id ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                    {saved[s.id] ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
