import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BookOpen, Video, ClipboardCheck, Award, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentEnrollments, getCourseProgress, getAssignmentsForCourses, getStudentSubmissions,
  getLiveClassesForCourses, getCertificatesForStudent,
} from '../../firebase/firestore';

export default function StudentOverview() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [avgProgress, setAvgProgress] = useState(0);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const enrollments = await getStudentEnrollments(user.uid);
        const courseIds = enrollments.map((e) => e.courseId);

        const [assignments, submissions, liveClasses, certificates, progressList] = await Promise.all([
          getAssignmentsForCourses(courseIds),
          getStudentSubmissions(user.uid),
          getLiveClassesForCourses(courseIds),
          getCertificatesForStudent(user.uid),
          Promise.all(enrollments.map((e) => getCourseProgress(user.uid, e.courseId))),
        ]);

        const submittedIds = new Set(submissions.map((s) => s.assignmentId));
        const pendingAssignments = assignments.filter((a) => !submittedIds.has(a.id)).length;

        setStats({
          enrolled: enrollments.length,
          liveClasses: liveClasses.length,
          pendingAssignments,
          certificates: certificates.length,
        });

        const avg = progressList.length > 0
          ? Math.round(progressList.reduce((sum, p) => sum + p.percent, 0) / progressList.length)
          : 0;
        setAvgProgress(avg);

        setUpcoming(liveClasses.slice(0, 3));
      } catch {
        setStats({ enrolled: 0, liveClasses: 0, pendingAssignments: 0, certificates: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const statCards = [
    { label: 'Enrolled Courses', value: stats?.enrolled ?? 0, icon: BookOpen, tone: 'bg-primary/10 text-primary' },
    { label: 'Live Classes Available', value: stats?.liveClasses ?? 0, icon: Video, tone: 'bg-secondary/10 text-secondary' },
    { label: 'Pending Assignments', value: stats?.pendingAssignments ?? 0, icon: ClipboardCheck, tone: 'bg-amber-500/10 text-amber-500' },
    { label: 'Certificates Earned', value: stats?.certificates ?? 0, icon: Award, tone: 'bg-emerald-500/10 text-emerald-500' },
  ];

  const progressChartData = [
    { name: 'Completed', value: avgProgress, color: '#6C63FF' },
    { name: 'Remaining', value: 100 - avgProgress, color: '#E4E2FF' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-20 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading your dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
              <s.icon size={18} />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-ink-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Upcoming Live Classes</h3>
          {upcoming.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">No live classes scheduled for your courses yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-ink-100 dark:divide-white/10">
              {upcoming.map((u) => (
                <div key={u.id} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{u.topic}</p>
                    <p className="text-xs text-ink-400">{u.courseTitle} · {u.teacherName}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">{u.scheduledTime}</span>
                </div>
              ))}
            </div>
          )}
          <Link to="/student/live-classes" className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Overall Progress</h3>
          <div className="relative mt-4 flex h-44 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={progressChartData} innerRadius={55} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270}>
                  {progressChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="font-display text-2xl font-bold text-ink-900 dark:text-white">{avgProgress}%</p>
              <p className="text-xs text-ink-400">Complete</p>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-ink-400">Average across all enrolled courses</p>
        </div>
      </div>
    </div>
  );
}
