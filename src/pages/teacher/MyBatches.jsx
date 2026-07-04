import { useEffect, useState } from 'react';
import { Users, Loader2, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCoursesTaughtByTeacher, getStudentsEnrolledInCourse, issueCertificate } from '../../firebase/firestore';

export default function MyBatches() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [issuing, setIssuing] = useState(null);
  const [issuedIds, setIssuedIds] = useState({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCoursesTaughtByTeacher(user.uid);
        setCourses(data);
        if (data.length > 0) setActiveCourse(data[0]);
      } catch {
        setError('Could not load your courses.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!activeCourse) return;
    (async () => {
      setLoadingStudents(true);
      try {
        const data = await getStudentsEnrolledInCourse(activeCourse.courseId);
        setStudents(data);
      } catch {
        setError('Could not load students for this course.');
      } finally {
        setLoadingStudents(false);
      }
    })();
  }, [activeCourse]);

  const handleIssueCertificate = async (enrollment) => {
    if (!enrollment.student) return;
    setIssuing(enrollment.studentId);
    try {
      const certId = await issueCertificate({
        studentId: enrollment.studentId,
        studentName: enrollment.student.name,
        courseId: activeCourse.courseId,
        courseTitle: activeCourse.courseTitle,
        teacherId: user.uid,
      });
      setIssuedIds((m) => ({ ...m, [enrollment.studentId]: certId }));
    } catch {
      setError('Could not issue certificate. Please try again.');
    } finally {
      setIssuing(null);
    }
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <Users size={22} className="text-primary" /> My Students
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Courses you've taught (posted an assignment, test, or live class for) and everyone real enrolled in them.
      </p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading...</div>
      ) : error && courses.length === 0 ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : courses.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          You haven't posted an assignment, test, or live class yet — do that first from the sidebar,
          and the course will appear here with its enrolled students.
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {courses.map((c) => (
              <button
                key={c.courseId}
                onClick={() => setActiveCourse(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  activeCourse?.courseId === c.courseId ? 'bg-brand-gradient text-white shadow-glow' : 'bg-ink-50 dark:bg-white/5 text-ink-600 dark:text-ink-100'
                }`}
              >
                {c.courseTitle}
              </button>
            ))}
          </div>

          {loadingStudents ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> Loading students...</div>
          ) : students.length === 0 ? (
            <p className="mt-8 text-sm text-ink-400">No students enrolled in this course yet.</p>
          ) : (
            <div className="mt-6 divide-y divide-ink-100 dark:divide-white/10 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
              {students.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-display font-semibold text-primary">
                      {(e.student?.name || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900 dark:text-white">{e.student?.name || 'Unknown student'}</p>
                      <p className="text-xs text-ink-400">{e.student?.email}</p>
                    </div>
                  </div>
                  {issuedIds[e.studentId] ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                      <CheckCircle2 size={13} /> Certificate Issued
                    </span>
                  ) : (
                    <button
                      onClick={() => handleIssueCertificate(e)}
                      disabled={issuing === e.studentId}
                      className="btn-outline !py-1.5 !px-3 text-xs disabled:opacity-60"
                    >
                      {issuing === e.studentId ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />} Issue Certificate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
