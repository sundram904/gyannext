import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { BarChart2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getCoursesTaughtByTeacher, getStudentsEnrolledInCourse, getAssignmentsByTeacher,
  getTestsByTeacher, getStudentSubmissions, getStudentTestAttempts,
} from '../../firebase/firestore';

export default function TeacherReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [courses, myAssignments, myTests] = await Promise.all([
          getCoursesTaughtByTeacher(user.uid),
          getAssignmentsByTeacher(user.uid),
          getTestsByTeacher(user.uid),
        ]);
        const assignmentIds = new Set(myAssignments.map((a) => a.id));
        const testIds = new Set(myTests.map((t) => t.id));

        const enrollmentsPerCourse = await Promise.all(
          courses.map((c) => getStudentsEnrolledInCourse(c.courseId))
        );
        const uniqueStudents = {};
        enrollmentsPerCourse.flat().forEach((e) => {
          if (e.student) uniqueStudents[e.studentId] = e.student;
        });

        const rows = await Promise.all(
          Object.entries(uniqueStudents).map(async ([studentId, student]) => {
            const [submissions, attempts] = await Promise.all([
              getStudentSubmissions(studentId), getStudentTestAttempts(studentId),
            ]);
            const relevantSubs = submissions.filter((s) => assignmentIds.has(s.assignmentId));
            const relevantAttempts = attempts.filter((a) => testIds.has(a.testId));

            const assignmentCompletion = myAssignments.length > 0
              ? Math.round((relevantSubs.length / myAssignments.length) * 100) : 0;
            const testAvg = relevantAttempts.length > 0
              ? Math.round(relevantAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / relevantAttempts.length)
              : 0;

            return { name: student.name || 'Student', assignments: assignmentCompletion, tests: testAvg };
          })
        );
        setData(rows);
      } catch {
        setError('Could not load student reports.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <BarChart2 size={22} className="text-primary" /> Student Reports
      </h1>
      <p className="mt-1 text-sm text-ink-400">Real assignment completion % and average test scores across the students in your courses.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400"><Loader2 size={18} className="animate-spin" /> Loading...</div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : data.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          No students yet — post an assignment or test to start seeing reports.
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEF6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#7A7A94" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#7A7A94" domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="assignments" name="Assignment Completion %" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="tests" name="Avg Test Score %" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
