import { Users, ClipboardCheck, Video, Star, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const stats = [
  { label: 'Active Students', value: '186', icon: Users, tone: 'bg-primary/10 text-primary' },
  { label: 'Pending Submissions', value: '12', icon: ClipboardCheck, tone: 'bg-amber-500/10 text-amber-500' },
  { label: 'Classes This Week', value: '9', icon: Video, tone: 'bg-secondary/10 text-secondary' },
  { label: 'Avg. Rating', value: '4.8', icon: Star, tone: 'bg-emerald-500/10 text-emerald-500' },
];

const batchPerf = [
  { batch: 'Py-A', avg: 82 }, { batch: 'Py-B', avg: 76 }, { batch: 'DSA-1', avg: 88 }, { batch: 'DSA-2', avg: 71 },
];

export default function TeacherOverview() {
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
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Batch Average Scores</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchPerf}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEF6" />
                <XAxis dataKey="batch" axisLine={false} tickLine={false} fontSize={12} stroke="#7A7A94" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Bar dataKey="avg" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="mt-4 space-y-2.5">
            {[
              { to: '/teacher/assignments', label: 'Create Assignment' },
              { to: '/teacher/tests', label: 'Create Test' },
              { to: '/teacher/content', label: 'Upload Video / Notes' },
              { to: '/teacher/live-classes', label: 'Start Live Class' },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center justify-between rounded-xl bg-ink-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-ink-700 dark:text-ink-100 hover:bg-primary/10 hover:text-primary transition-colors">
                {a.label} <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
