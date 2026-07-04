import { useEffect, useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { StatCard } from '../../components/ui/Primitives';
import { getAllDocs } from '../../firebase/firestore';

function monthKey(timestamp) {
  if (!timestamp?.toDate) return null;
  return timestamp.toDate().toLocaleString('en-US', { month: 'short', year: '2-digit' });
}

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [enrollments, submissions, liveClasses, testAttempts, certificates] = await Promise.all([
          getAllDocs('enrollments'), getAllDocs('submissions'), getAllDocs('liveClasses'),
          getAllDocs('testAttempts'), getAllDocs('certificates'),
        ]);
        setData({ enrollments, submissions, liveClasses, testAttempts, certificates });
      } catch {
        setError('Could not load reports right now.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center gap-2 py-20 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading reports...</div>;
  if (error) return <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>;

  const { enrollments, submissions, liveClasses, testAttempts, certificates } = data;
  const completed = enrollments.filter((e) => (e.progress || 0) >= 100).length;
  const completionRate = enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0;

  const trendMap = {};
  enrollments.forEach((e) => {
    const key = monthKey(e.enrolledAt);
    if (key) trendMap[key] = (trendMap[key] || 0) + 1;
  });
  const trend = Object.entries(trendMap).map(([month, count]) => ({ month, count }));

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <TrendingUp size={22} className="text-primary" /> Reports & Analytics
      </h1>
      <p className="mt-1 text-sm text-ink-400">Every figure below is computed live from real platform activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Course Completion Rate" value={`${completionRate}%`} />
        <StatCard label="Assignments Submitted" value={submissions.length} />
        <StatCard label="Live Classes Held" value={liveClasses.length} />
        <StatCard label="Test Attempts" value={testAttempts.length} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Enrollments" value={enrollments.length} />
        <StatCard label="Certificates Issued" value={certificates.length} />
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
        <h3 className="font-display font-semibold text-ink-900 dark:text-white">Enrollments by Month</h3>
        {trend.length === 0 ? (
          <p className="mt-6 text-sm text-ink-400">Not enough enrollment history yet to chart.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEF6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} stroke="#7A7A94" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#7A7A94" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#4F8CFF" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
