import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentEnrollments, getCourseProgress, getStudentTestAttempts, getTestsForCourses } from '../../firebase/firestore';
import { getCourseById } from '../../data/courses';

export default function Progress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseProgress, setCourseProgress] = useState([]);
  const [testScores, setTestScores] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const enrollments = await getStudentEnrollments(user.uid);
        const courseIds = enrollments.map((e) => e.courseId);

        const progressList = await Promise.all(
          enrollments.map(async (enr) => {
            const course = getCourseById(enr.courseId);
            const p = await getCourseProgress(user.uid, enr.courseId);
            return { course: course?.title || enr.courseId, percent: p.percent };
          })
        );
        setCourseProgress(progressList);

        const [tests, attempts] = await Promise.all([
          getTestsForCourses(courseIds), getStudentTestAttempts(user.uid),
        ]);
        const testsById = Object.fromEntries(tests.map((t) => [t.id, t]));
        const scores = attempts
          .filter((a) => testsById[a.testId])
          .map((a) => ({
            name: testsById[a.testId].title,
            score: Math.round((a.score / a.total) * 100),
          }));
        setTestScores(scores);
      } catch {
        setError('Could not load progress right now.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Progress Report</h1>
      <p className="mt-1 text-sm text-ink-400">Real numbers — computed from your actual assignments, tests, and submissions.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading...</div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : courseProgress.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">Enroll in a course to start tracking your progress.</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
            <h3 className="flex items-center gap-2 font-display font-semibold text-ink-900 dark:text-white">
              <TrendingUp size={18} className="text-primary" /> Test Scores
            </h3>
            {testScores.length === 0 ? (
              <p className="mt-6 text-sm text-ink-400">You haven't attempted any tests yet.</p>
            ) : (
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testScores}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEF6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} stroke="#7A7A94" />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#7A7A94" domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} formatter={(v) => `${v}%`} />
                    <Bar dataKey="score" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
            <h3 className="font-display font-semibold text-ink-900 dark:text-white">Course Completion</h3>
            <div className="mt-5 space-y-5">
              {courseProgress.map((c) => (
                <div key={c.course}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-700 dark:text-ink-100">{c.course}</span>
                    <span className="font-semibold text-primary">{c.percent}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-ink-100 dark:bg-white/10">
                    <div className="h-2 rounded-full bg-brand-gradient" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
