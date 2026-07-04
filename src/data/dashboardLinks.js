import {
  LayoutDashboard, BookOpen, Video, ClipboardCheck, ListChecks, CalendarCheck,
  TrendingUp, Award, Sparkles, Bell, UserCircle, Users, UploadCloud, FileCheck2,
  BarChart2, UserCheck, Users2, Layers, Megaphone, Settings,
} from 'lucide-react';

export const studentLinks = [
  { to: '/student/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/student/courses', label: 'My Courses', icon: BookOpen },
  { to: '/student/live-classes', label: 'Live Classes', icon: Video },
  { to: '/student/assignments', label: 'Assignments', icon: ClipboardCheck },
  { to: '/student/tests', label: 'Tests', icon: ListChecks },
  { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/student/progress', label: 'Progress Report', icon: TrendingUp },
  { to: '/student/certificates', label: 'Certificates', icon: Award },
  { to: '/student/ai-assistant', label: 'AI Doubt Assistant', icon: Sparkles },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
];

export const teacherLinks = [
  { to: '/teacher/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/teacher/batches', label: 'My Batches', icon: Users },
  { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardCheck },
  { to: '/teacher/tests', label: 'Create Test', icon: ListChecks },
  { to: '/teacher/content', label: 'Upload Content', icon: UploadCloud },
  { to: '/teacher/live-classes', label: 'Live Classes', icon: Video },
  { to: '/teacher/submissions', label: 'Submissions', icon: FileCheck2 },
  { to: '/teacher/reports', label: 'Student Reports', icon: BarChart2 },
  { to: '/teacher/profile', label: 'Profile', icon: UserCircle },
];

export const adminLinks = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/teacher-approvals', label: 'Teacher Approvals', icon: UserCheck },
  { to: '/admin/students', label: 'Students', icon: Users2 },
  { to: '/admin/courses', label: 'Courses & Batches', icon: Layers },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];
