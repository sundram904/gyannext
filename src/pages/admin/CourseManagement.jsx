import { useEffect, useState } from 'react';
import { BookOpen, Video, Loader2, Users } from 'lucide-react';
import { ALL_COURSES } from '../../data/courses';
import { getAllDocs } from '../../firebase/firestore';
import { Badge } from '../../components/ui/Primitives';

export default function CourseManagement() {
  const [tab, setTab] = useState('courses');
  const [enrollments, setEnrollments] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [e, lc] = await Promise.all([getAllDocs('enrollments'), getAllDocs('liveClasses')]);
        setEnrollments(e);
        setLiveClasses(lc);
      } catch {
        setError('Could not load course & class data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const enrollCountFor = (courseId) => enrollments.filter((e) => e.courseId === courseId).length;

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <BookOpen size={22} className="text-primary" /> Course & Class Management
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        The catalog is fixed content; enrollment counts and scheduled classes below are live from Firestore.
      </p>

      <div className="mt-6 flex gap-2">
        {[{ key: 'courses', label: 'Courses', icon: BookOpen }, { key: 'classes', label: 'Live Classes', icon: Video }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
              tab === t.key ? 'bg-brand-gradient text-white shadow-glow' : 'bg-ink-50 dark:bg-white/5 text-ink-600 dark:text-ink-100'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading...</div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : tab === 'courses' ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-white/10 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Instructor</th>
                <th className="px-5 py-3 font-medium">Real Enrollments</th>
                <th className="px-5 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-white/10">
              {ALL_COURSES.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-white">{c.title}</td>
                  <td className="px-5 py-3.5"><Badge>{c.category}</Badge></td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-100">{c.instructor}</td>
                  <td className="px-5 py-3.5 font-semibold text-primary">{enrollCountFor(c.id)}</td>
                  <td className="px-5 py-3.5 font-semibold text-ink-900 dark:text-white">₹{c.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : liveClasses.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">No live classes scheduled by any teacher yet.</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liveClasses.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
              <p className="font-display font-semibold text-ink-900 dark:text-white">{c.topic}</p>
              <p className="text-xs text-ink-400">{c.courseTitle}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-500 dark:text-ink-100">
                <span className="flex items-center gap-1"><Users size={12} /> {c.teacherName}</span>
                <span>{c.scheduledTime}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
