// Static demo catalog. In production this mirrors the `courses` Firestore collection —
// see getAllCourses() in src/firebase/firestore.js for the live-data equivalent.

export const CATEGORIES = [
  { id: 'school', label: 'School Learning', icon: 'GraduationCap', color: 'from-primary to-primary-600' },
  { id: 'programming', label: 'Programming', icon: 'Code2', color: 'from-secondary to-secondary-600' },
  { id: 'skill', label: 'Skill Development', icon: 'Sparkles', color: 'from-primary-400 to-secondary-500' },
];

const schoolClasses = [3, 4, 5, 6, 7, 8, 9, 10];

const schoolCourses = schoolClasses.map((cls) => ({
  id: `school-class-${cls}`,
  category: 'school',
  title: `Class ${cls} — Complete Curriculum`,
  subtitle: 'CBSE & Bihar Board aligned',
  instructor: cls <= 5 ? 'Anita Sharma' : cls <= 8 ? 'Rakesh Kumar' : 'Dr. Meera Singh',
  boards: ['CBSE', 'Bihar Board'],
  chapters: 12,
  lessons: 60 + cls * 2,
  duration: `${cls <= 6 ? '5' : '7'} months`,
  rating: 4.6 + (cls % 3) * 0.1,
  students: 800 + cls * 120,
  price: 1499 + cls * 100,
  level: cls <= 5 ? 'Foundation' : cls <= 8 ? 'Middle School' : 'Board Prep',
  description: `A complete, board-aligned curriculum for Class ${cls} covering Maths, Science, English and Social Studies with live doubt-clearing, recorded backup classes, printable notes and chapter-wise tests.`,
  includes: ['Recorded Videos', 'PDF Notes', 'Live Classes', 'Assignments', 'Tests', 'Certificate'],
}));

const programmingList = [
  { key: 'c', title: 'C Programming', level: 'Beginner', instructor: 'Suresh Yadav', chapters: 10, lessons: 48 },
  { key: 'cpp', title: 'C++ Programming', level: 'Beginner to Advanced', instructor: 'Suresh Yadav', chapters: 14, lessons: 64 },
  { key: 'java', title: 'Java Programming', level: 'Beginner to Advanced', instructor: 'Priya Nair', chapters: 16, lessons: 70 },
  { key: 'python', title: 'Python Programming', level: 'Beginner to Advanced', instructor: 'Priya Nair', chapters: 15, lessons: 66 },
  { key: 'html', title: 'HTML', level: 'Beginner', instructor: 'Rohit Verma', chapters: 8, lessons: 32 },
  { key: 'css', title: 'CSS', level: 'Beginner', instructor: 'Rohit Verma', chapters: 9, lessons: 36 },
  { key: 'javascript', title: 'JavaScript', level: 'Beginner to Advanced', instructor: 'Rohit Verma', chapters: 18, lessons: 80 },
  { key: 'react', title: 'React JS', level: 'Intermediate', instructor: 'Ankit Gupta', chapters: 14, lessons: 60 },
  { key: 'nodejs', title: 'Node.js', level: 'Intermediate', instructor: 'Ankit Gupta', chapters: 12, lessons: 50 },
  { key: 'sql', title: 'SQL', level: 'Beginner to Advanced', instructor: 'Neha Singh', chapters: 11, lessons: 45 },
  { key: 'mongodb', title: 'MongoDB', level: 'Intermediate', instructor: 'Neha Singh', chapters: 9, lessons: 38 },
  { key: 'linux', title: 'Linux', level: 'Beginner to Advanced', instructor: 'Vikas Jha', chapters: 10, lessons: 42 },
  { key: 'git', title: 'Git & GitHub', level: 'Beginner', instructor: 'Vikas Jha', chapters: 7, lessons: 28 },
  { key: 'dsa', title: 'Data Structures & Algorithms', level: 'Intermediate to Advanced', instructor: 'Dr. Sameer Khan', chapters: 20, lessons: 96 },
  { key: 'cybersecurity', title: 'Cyber Security', level: 'Intermediate', instructor: 'Dr. Sameer Khan', chapters: 13, lessons: 54 },
  { key: 'ai-basics', title: 'AI Basics', level: 'Beginner to Intermediate', instructor: 'Dr. Kavita Rao', chapters: 12, lessons: 48 },
];

const programmingCourses = programmingList.map((c) => ({
  id: `prog-${c.key}`,
  category: 'programming',
  title: c.title,
  subtitle: `Hands-on ${c.title} with real projects`,
  instructor: c.instructor,
  chapters: c.chapters,
  lessons: c.lessons,
  duration: `${Math.max(2, Math.round(c.chapters / 3))} months`,
  rating: 4.5 + ((c.chapters % 5) * 0.08),
  students: 500 + c.lessons * 15,
  price: 999 + c.chapters * 80,
  level: c.level,
  description: `Master ${c.title} from the ground up through project-based lessons, quizzes, coding tests and a certificate of completion — built for absolute beginners and upskillers alike.`,
  includes: ['Recorded Videos', 'PDF Notes', 'Assignments', 'Coding Tests', 'Progress Tracking', 'Certificate'],
}));

const skillList = [
  { key: 'spoken-english', title: 'Spoken English', instructor: 'Fiona D\'Souza', chapters: 10, lessons: 40 },
  { key: 'typing', title: 'Typing Mastery', instructor: 'Fiona D\'Souza', chapters: 6, lessons: 24 },
  { key: 'ms-office', title: 'MS Office Essentials', instructor: 'Rajeev Ranjan', chapters: 9, lessons: 36 },
  { key: 'resume-building', title: 'Resume Building', instructor: 'Rajeev Ranjan', chapters: 5, lessons: 20 },
  { key: 'interview-prep', title: 'Interview Preparation', instructor: 'Rajeev Ranjan', chapters: 8, lessons: 32 },
];

const skillCourses = skillList.map((c) => ({
  id: `skill-${c.key}`,
  category: 'skill',
  title: c.title,
  subtitle: 'Practical, job-ready training',
  instructor: c.instructor,
  chapters: c.chapters,
  lessons: c.lessons,
  duration: `${Math.max(1, Math.round(c.chapters / 4))} months`,
  rating: 4.6,
  students: 300 + c.lessons * 10,
  price: 699 + c.chapters * 60,
  level: 'All Levels',
  description: `${c.title} designed to make you interview- and workplace-ready, with practical drills, mock sessions and personalised feedback.`,
  includes: ['Recorded Videos', 'PDF Notes', 'Assignments', 'Live Practice', 'Certificate'],
}));

export const ALL_COURSES = [...schoolCourses, ...programmingCourses, ...skillCourses];

export const FEATURED_COURSE_IDS = [
  'prog-python', 'prog-react', 'school-class-10', 'prog-dsa', 'skill-interview-prep', 'prog-javascript',
];

export const FEATURED_COURSES = ALL_COURSES.filter((c) => FEATURED_COURSE_IDS.includes(c.id));

export function getCourseById(id) {
  return ALL_COURSES.find((c) => c.id === id) || null;
}

export function getCoursesByCategory(category) {
  return ALL_COURSES.filter((c) => c.category === category);
}
