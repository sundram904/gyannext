import { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, ClipboardCheck, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { getAllStudents, getAllTeachers, getAllDocs } from '../../firebase/firestore';
import { ALL_COURSES } from '../../data/courses';

const CATEGORY_COLORS = { school: '#6C63FF', programming: '#4F8CFF', skill: '#34D399' };
const CATEGORY_LABEL = { school: 'School', programming: 'Programming', skill: 'Skill' };

function monthKey(timestamp) {
  if (!timestamp?.toDate) return null;
  const d = timestamp.toDate();
  return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [s, t, e] = await Promise.all([
          getAllStudents(), getAllTeachers(), getAllDocs('enrollments'),
        ]);
        setStudents(s);
        setTeachers(t);
        setEnrollments(e);
      } catch {
        setError('Could not load platform analytics right now.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-20 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading analytics...</div>;
  }
  if (error) {
    return <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>;
  }

  const activeTeachers = teachers.filter((t) => t.status === 'active');
  const pendingTeachers = teachers.filter((t) => t.status === 'pending');

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, tone: 'bg-primary/10 text-primary' },
    { label: 'Active Teachers', value: activeTeachers.length, icon: GraduationCap, tone: 'bg-secondary/10 text-secondary' },
    { label: 'Courses in Catalog', value: ALL_COURSES.length, icon: BookOpen, tone: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Pending Approvals', value: pendingTeachers.length, icon: ClipboardCheck, tone: 'bg-amber-500/10 text-amber-500' },
  ];

  // Real signup growth, bucketed by month from actual createdAt timestamps.
  const growthMap = {};
  students.forEach((s) => {
    const key = monthKey(s.createdAt);
    if (key) growthMap[key] = (growthMap[key] || 0) + 1;
  });
  const growth = Object.entries(growthMap).map(([month, count]) => ({ month, count }));

  // Real enrollment-by-category split, computed from actual enrollment records.
  const categoryCounts = { school: 0, programming: 0, skill: 0 };
  enrollments.forEach((e) => {
    const course = ALL_COURSES.find((c) => c.id === e.courseId);
    if (course) categoryCounts[course.category] += 1;
  });
  const categorySplit = Object.entries(categoryCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: CATEGORY_LABEL[k], value: v, color: CATEGORY_COLORS[k] }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}><s.icon size={18} /></div>
            <p className="mt-3 font-display text-2xl font-bold text-ink-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-ink-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Student Signups by Month</h3>
          {growth.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">Not enough signup history yet to chart.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growth}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} stroke="#7A7A94" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#6C63FF" strokeWidth={2.5} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Enrollment by Category</h3>
          {categorySplit.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">No enrollments yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySplit} innerRadius={50} outerRadius={80} dataKey="value">
                    {categorySplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
