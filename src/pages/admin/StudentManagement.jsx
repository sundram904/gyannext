import { useEffect, useState } from 'react';
import { Search, Users2, MoreVertical, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/Primitives';
import { getAllStudents, suspendUser, reactivateUser } from '../../firebase/firestore';

export default function StudentManagement() {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (err) {
      setError('Could not load students. Check your Firestore rules & connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (student) => {
    setOpenMenu(null);
    const next = student.status === 'suspended' ? 'active' : 'suspended';
    setStudents((s) => s.map((st) => (st.id === student.id ? { ...st, status: next } : st)));
    try {
      if (next === 'suspended') await suspendUser(student.id);
      else await reactivateUser(student.id);
    } catch {
      load(); // revert to server truth if it failed
    }
  };

  const filtered = students.filter((s) => (s.name || '').toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <Users2 size={22} className="text-primary" /> Student Management
      </h1>
      <p className="mt-1 text-sm text-ink-400">Every student who signs up on GyanNext appears here in real time.</p>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 px-3 py-2.5 sm:w-80">
        <Search size={16} className="text-ink-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search students..." />
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400">
          <Loader2 size={18} className="animate-spin" /> Loading students...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          No students yet. Once someone signs up at <span className="font-mono">/register</span>, they'll show up here.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-white/10 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Courses Enrolled</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Parent</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-white/10">
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-900 dark:text-white">{s.name || 'Unnamed'}</p>
                    <p className="text-xs text-ink-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-600 dark:text-ink-100">{s.enrolledCourses?.length || 0}</td>
                  <td className="px-5 py-4"><Badge tone={s.status === 'suspended' ? 'red' : 'green'}>{s.status || 'active'}</Badge></td>
                  <td className="px-5 py-4 text-ink-400">{s.parentName || '—'}</td>
                  <td className="px-5 py-4 text-right relative">
                    <button onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)} className="text-ink-400 hover:text-primary">
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === s.id && (
                      <div className="absolute right-5 top-10 z-10 w-40 rounded-xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900 shadow-card">
                        <button onClick={() => toggleStatus(s)} className="block w-full px-4 py-2.5 text-left text-xs font-medium text-ink-600 dark:text-ink-100 hover:bg-ink-50 dark:hover:bg-white/5">
                          {s.status === 'suspended' ? 'Reactivate' : 'Suspend'} account
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
