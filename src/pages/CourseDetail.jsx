import { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Star, Users, Clock, Layers, PlayCircle, FileText, ClipboardCheck,
  TrendingUp, Award, ChevronDown, CheckCircle2, BookOpen, Loader2,
} from 'lucide-react';
import { getCourseById } from '../data/courses';
import { useAuth } from '../context/AuthContext';
import { enrollStudentInCourse } from '../firebase/firestore';

const INCLUDE_ICON = {
  'Recorded Videos': PlayCircle,
  'PDF Notes': FileText,
  'Live Classes': Users,
  'Live Practice': Users,
  Assignments: ClipboardCheck,
  Tests: ClipboardCheck,
  'Coding Tests': ClipboardCheck,
  'Progress Tracking': TrendingUp,
  Certificate: Award,
};

function buildChapters(course) {
  return Array.from({ length: course.chapters }).map((_, i) => ({
    id: i + 1,
    title: `Chapter ${i + 1}: ${i === 0 ? 'Getting Started' : i === course.chapters - 1 ? 'Final Project & Review' : `Core Concepts Part ${i}`}`,
    lessons: Math.round(course.lessons / course.chapters),
  }));
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const course = getCourseById(courseId);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [openChapter, setOpenChapter] = useState(1);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState('');

  if (!course) return <Navigate to="/courses" replace />;

  const chapters = buildChapters(course);

  const handleEnroll = async () => {
    if (!user) { navigate('/register'); return; }
    if (role !== 'student') { setError('Only student accounts can enroll in courses.'); return; }
    setError('');
    setEnrolling(true);
    try {
      await enrollStudentInCourse(user.uid, course.id);
      setEnrolled(true);
    } catch {
      setError('Could not enroll right now. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div>
      <section className="bg-brand-radial border-b border-ink-100 dark:border-white/10 py-12">
        <div className="container-app grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="section-eyebrow">{course.level}</span>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-ink-400">{course.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-amber-500">
                <Star size={15} className="fill-amber-400 text-amber-400" /> {course.rating.toFixed(1)} rating
              </span>
              <span className="flex items-center gap-1.5 text-ink-500 dark:text-ink-100"><Users size={15} /> {course.students}+ students</span>
              <span className="flex items-center gap-1.5 text-ink-500 dark:text-ink-100"><Clock size={15} /> {course.duration}</span>
              <span className="flex items-center gap-1.5 text-ink-500 dark:text-ink-100"><Layers size={15} /> {course.chapters} chapters</span>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-4 max-w-md">
              <img src="https://i.pravatar.cc/80?img=15" alt={course.instructor} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="text-xs text-ink-400">Instructor</p>
                <p className="font-display font-semibold text-ink-900 dark:text-white">{course.instructor}</p>
              </div>
            </div>
          </div>

          <div className="glass-card h-fit p-6">
            <p className="font-display text-3xl font-bold text-ink-900 dark:text-white">₹{course.price}</p>
            <p className="text-sm text-ink-400">One-time enrollment fee</p>
            {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}
            {enrolled ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 size={16} /> Enrolled! Find it in your dashboard.
              </div>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling} className="btn-primary mt-5 w-full disabled:opacity-60">
                {enrolling ? <Loader2 size={16} className="animate-spin" /> : null}
                {enrolling ? 'Enrolling...' : user ? 'Enroll Now' : 'Sign up to Enroll'}
              </button>
            )}
            {enrolled && (
              <Link to="/student/courses" className="btn-outline mt-3 w-full">Go to My Courses</Link>
            )}
            <Link to="/admission" className="btn-outline mt-3 w-full">Apply via Admission Form</Link>
            <div className="mt-5 space-y-2.5 border-t border-ink-100 dark:border-white/10 pt-5">
              {course.includes.map((inc) => {
                const Icon = INCLUDE_ICON[inc] || CheckCircle2;
                return (
                  <div key={inc} className="flex items-center gap-2.5 text-sm text-ink-600 dark:text-ink-100">
                    <Icon size={16} className="text-primary" /> {inc}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container-app grid grid-cols-1 gap-10 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
            <BookOpen size={22} className="text-primary" /> Curriculum
          </h2>
          <div className="mt-6 divide-y divide-ink-100 dark:divide-white/10 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
            {chapters.map((ch) => {
              const isOpen = openChapter === ch.id;
              return (
                <div key={ch.id}>
                  <button
                    onClick={() => setOpenChapter(isOpen ? -1 : ch.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-ink-900 dark:text-white">{ch.title}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-ink-400">{ch.lessons} lessons</span>
                      <ChevronDown size={16} className={`text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="space-y-2 px-5 pb-4">
                      {Array.from({ length: ch.lessons }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2.5 rounded-lg bg-ink-50 dark:bg-white/5 px-3 py-2 text-xs text-ink-500 dark:text-ink-100">
                          <PlayCircle size={14} className="text-primary" /> Lesson {i + 1}: {ch.title.split(': ')[1]} — Part {i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">What's included</h3>
          <ul className="mt-4 space-y-3">
            {['Downloadable PDF notes for every chapter', 'Chapter-wise assignments with feedback', 'MCQ and coding tests', 'Real-time progress tracking dashboard', 'Certificate of completion with QR verification'].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-ink-500 dark:text-ink-100">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
