import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FileText, Award, Loader2, BookOpen, ChevronDown, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentEnrollments, getCourseProgress, getCourseContentForCourse } from '../../firebase/firestore';
import { getCourseById } from '../../data/courses';

export default function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [progressByCourse, setProgressByCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openContent, setOpenContent] = useState(null);
  const [contentByCourse, setContentByCourse] = useState({});
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getStudentEnrollments(user.uid);
        setEnrollments(data);
        const progressEntries = await Promise.all(
          data.map(async (enr) => [enr.courseId, await getCourseProgress(user.uid, enr.courseId)])
        );
        setProgressByCourse(Object.fromEntries(progressEntries));
      } catch {
        setError('Could not load your courses.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const toggleContent = async (courseId) => {
    if (openContent === courseId) { setOpenContent(null); return; }
    setOpenContent(courseId);
    if (!contentByCourse[courseId]) {
      setLoadingContent(true);
      try {
        const data = await getCourseContentForCourse(courseId);
        setContentByCourse((c) => ({ ...c, [courseId]: data }));
      } catch { /* non-fatal */ }
      setLoadingContent(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">My Courses</h1>
      <p className="mt-1 text-sm text-ink-400">Progress is real — calculated from assignments submitted and tests taken.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading your courses...</div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : enrollments.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 dark:border-white/10 py-16 text-center">
          <BookOpen size={28} className="text-ink-300" />
          <p className="text-sm text-ink-400">You haven't enrolled in any course yet.</p>
          <Link to="/courses" className="btn-primary mt-2 !py-2 text-sm">Browse Courses</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {enrollments.map((enr) => {
            const course = getCourseById(enr.courseId);
            if (!course) return null;
            const progress = progressByCourse[enr.courseId];
            const percent = progress?.percent ?? 0;
            const content = contentByCourse[enr.courseId] || [];
            return (
              <div key={enr.id} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-ink-900 dark:text-white">{course.title}</h3>
                    <p className="text-xs text-ink-400">{course.instructor}</p>
                  </div>
                  {percent >= 100 && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                      <Award size={12} /> Complete
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-ink-400">
                    <span>Progress {progress ? `(${progress.assignmentsDone + progress.testsDone}/${progress.assignmentsTotal + progress.testsTotal} done)` : ''}</span>
                    <span className="font-semibold text-primary">{percent}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-ink-100 dark:bg-white/10">
                    <div className="h-2 rounded-full bg-brand-gradient transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/courses/${course.id}`} className="btn-outline flex-1 !py-2 text-xs"><PlayCircle size={14} /> Course Page</Link>
                  <button onClick={() => toggleContent(course.id)} className="btn-ghost !py-2 text-xs">
                    <ChevronDown size={14} className={`transition-transform ${openContent === course.id ? 'rotate-180' : ''}`} /> Materials
                  </button>
                </div>

                {openContent === course.id && (
                  <div className="mt-3 space-y-2 border-t border-ink-100 dark:border-white/10 pt-3">
                    {loadingContent ? (
                      <p className="text-xs text-ink-400">Loading...</p>
                    ) : content.length === 0 ? (
                      <p className="text-xs text-ink-400">No videos or notes uploaded yet for this course.</p>
                    ) : (
                      content.map((item) => (
                        <a key={item.id} href={item.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-ink-50 dark:bg-white/5 px-3 py-2 text-xs text-ink-600 dark:text-ink-100 hover:bg-primary/5">
                          {item.type === 'video' ? <Video size={13} className="text-primary" /> : <FileText size={13} className="text-primary" />}
                          {item.title}
                        </a>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
