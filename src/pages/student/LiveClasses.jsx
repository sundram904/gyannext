import { useEffect, useState } from 'react';
import { Video, Clock, PlayCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentEnrollments, getLiveClassesForCourses, markLiveClassAttendance } from '../../firebase/firestore';
import LiveClassRoom from '../../components/live/LiveClassRoom';

export default function LiveClasses() {
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const enrollments = await getStudentEnrollments(user.uid);
        const courseIds = enrollments.map((e) => e.courseId);
        const data = await getLiveClassesForCourses(courseIds);
        setClasses(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      } catch {
        setError('Could not load your live classes right now.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Live Classes</h1>
      <p className="mt-1 text-sm text-ink-400">Join right here on GyanNext — your name joins automatically.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400">
          <Loader2 size={18} className="animate-spin" /> Loading live classes...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : classes.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          No live classes scheduled yet for your enrolled courses.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {classes.map((c) => (
            <div key={c.id} className="flex flex-col gap-4 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Video size={20} />
                </div>
                <div>
                  <p className="font-display font-semibold text-ink-900 dark:text-white">{c.topic}</p>
                  <p className="text-xs text-ink-400">{c.courseTitle} · {c.teacherName}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-400"><Clock size={12} /> {c.scheduledTime}</p>
                </div>
              </div>
              <button onClick={() => setActiveRoom(c)} className="btn-primary text-sm shrink-0">
                <PlayCircle size={16} /> Join Class
              </button>
            </div>
          ))}
        </div>
      )}

      {activeRoom && (
        <LiveClassRoom
          roomName={activeRoom.roomName}
          displayName={profile?.name || 'Student'}
          topic={activeRoom.topic}
          onClose={() => setActiveRoom(null)}
          onJoined={() => markLiveClassAttendance({
            classId: activeRoom.id,
            courseId: activeRoom.courseId,
            courseTitle: activeRoom.courseTitle,
            studentId: user.uid,
            studentName: profile?.name || 'Student',
          })}
        />
      )}
    </div>
  );
}
