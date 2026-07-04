import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentEnrollments, getLiveClassesForCourses, getStudentAttendance } from '../../firebase/firestore';

export default function Attendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const enrollments = await getStudentEnrollments(user.uid);
        const courseIds = enrollments.map((e) => e.courseId);
        const [classData, attendanceData] = await Promise.all([
          getLiveClassesForCourses(courseIds),
          getStudentAttendance(user.uid),
        ]);
        setClasses(classData);
        setAttendance(attendanceData);
      } catch {
        setError('Could not load attendance right now.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const attendedClassIds = new Set(attendance.map((a) => a.classId));
  const present = classes.filter((c) => attendedClassIds.has(c.id)).length;
  const absent = classes.length - present;
  const rate = classes.length > 0 ? Math.round((present / classes.length) * 100) : 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Attendance</h1>
      <p className="mt-1 text-sm text-ink-400">
        Marked automatically the moment you join a live class — no manual entry.
      </p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400">
          <Loader2 size={18} className="animate-spin" /> Loading attendance...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : classes.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          No live classes have been scheduled for your courses yet.
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 text-center">
              <p className="font-display text-2xl font-bold text-emerald-500">{present}</p>
              <p className="text-xs text-ink-400">Attended</p>
            </div>
            <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 text-center">
              <p className="font-display text-2xl font-bold text-red-500">{absent}</p>
              <p className="text-xs text-ink-400">Missed</p>
            </div>
            <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 text-center">
              <p className="font-display text-2xl font-bold text-primary">{rate}%</p>
              <p className="text-xs text-ink-400">Attendance Rate</p>
            </div>
            <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 text-center">
              <p className="font-display text-2xl font-bold text-ink-900 dark:text-white">{classes.length}</p>
              <p className="text-xs text-ink-400">Classes Held</p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-ink-100 dark:divide-white/10 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
            {classes.map((c) => {
              const attended = attendedClassIds.has(c.id);
              return (
                <div key={c.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{c.topic}</p>
                    <p className="text-xs text-ink-400">{c.courseTitle} · {c.scheduledTime}</p>
                  </div>
                  {attended ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                      <CheckCircle2 size={13} /> Present
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500">
                      <XCircle size={13} /> Not joined
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
