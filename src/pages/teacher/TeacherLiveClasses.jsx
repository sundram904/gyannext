import { useEffect, useState } from 'react';
import { Video, Plus, PlayCircle, Trash2, Loader2 } from 'lucide-react';
import { ALL_COURSES } from '../../data/courses';
import { useAuth } from '../../context/AuthContext';
import { createLiveClass, getLiveClassesByTeacher, deleteLiveClass, getAttendanceForClass } from '../../firebase/firestore';
import LiveClassRoom from '../../components/live/LiveClassRoom';
import { Users } from 'lucide-react';

export default function TeacherLiveClasses() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ topic: '', courseId: ALL_COURSES[0]?.id || '', time: '' });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [attendanceFor, setAttendanceFor] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const viewAttendance = async (cls) => {
    setAttendanceFor(cls);
    setAttendanceLoading(true);
    try {
      const data = await getAttendanceForClass(cls.id);
      setAttendanceList(data);
    } catch {
      setAttendanceList([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getLiveClassesByTeacher(user.uid);
      setClasses(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch {
      setError('Could not load your scheduled classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const course = ALL_COURSES.find((c) => c.id === form.courseId);
      await createLiveClass({
        teacherId: user.uid,
        teacherName: profile?.name || 'Teacher',
        courseId: form.courseId,
        courseTitle: course?.title || '',
        topic: form.topic,
        scheduledTime: form.time,
      });
      setForm({ topic: '', courseId: ALL_COURSES[0]?.id || '', time: '' });
      load();
    } catch {
      setError('Could not schedule the class. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    setClasses((c) => c.filter((cl) => cl.id !== id));
    try { await deleteLiveClass(id); } catch { load(); }
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <Video size={22} className="text-primary" /> Live Classes
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Schedule a class — a private video room is created automatically and shows up instantly on
        every enrolled student's dashboard. No external links to copy.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Schedule a Class</h3>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <div className="mt-4 space-y-4">
            <input required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="input-field" placeholder="Topic" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="input-field">
                {ALL_COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input-field" placeholder="e.g. Today, 6 PM" />
            </div>
          </div>
          <button type="submit" disabled={creating} className="btn-primary mt-5 disabled:opacity-60">
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {creating ? 'Scheduling...' : 'Schedule Class'}
          </button>
        </form>

        <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Your Classes</h3>
          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : classes.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">No classes scheduled yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {classes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-ink-50 dark:bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{c.topic}</p>
                    <p className="text-xs text-ink-400">{c.courseTitle} · {c.scheduledTime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveRoom(c)} className="btn-primary !py-1.5 !px-3 text-xs"><PlayCircle size={14} /> Start</button>
                    <button onClick={() => viewAttendance(c)} className="btn-outline !py-1.5 !px-3 text-xs"><Users size={14} /> Attendance</button>
                    <button onClick={() => handleDelete(c.id)} className="text-ink-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeRoom && (
        <LiveClassRoom
          roomName={activeRoom.roomName}
          displayName={profile?.name || 'Teacher'}
          topic={activeRoom.topic}
          onClose={() => setActiveRoom(null)}
        />
      )}

      {attendanceFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-ink-900 p-6 shadow-xl">
            <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{attendanceFor.topic}</h3>
            <p className="text-xs text-ink-400">Students who joined this class</p>
            {attendanceLoading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> Loading...</div>
            ) : attendanceList.length === 0 ? (
              <p className="mt-6 text-sm text-ink-400">No one has joined this class yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {attendanceList.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl bg-ink-50 dark:bg-white/5 px-4 py-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {(a.studentName || 'S').charAt(0)}
                    </div>
                    <span className="text-sm text-ink-700 dark:text-ink-100">{a.studentName}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setAttendanceFor(null)} className="btn-outline mt-5 w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
