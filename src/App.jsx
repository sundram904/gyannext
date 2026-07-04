import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/dashboard/DashboardLayout';

import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Contact from './pages/Contact';
import Admission from './pages/Admission';
import VerifyCertificate from './pages/VerifyCertificate';
import NotFound from './pages/NotFound';

import StudentLogin from './pages/auth/StudentLogin';
import TeacherLogin from './pages/auth/TeacherLogin';
import AdminLogin from './pages/auth/AdminLogin';
import StudentRegister from './pages/auth/StudentRegister';
import TeacherRegister from './pages/auth/TeacherRegister';
import ForgotPassword from './pages/auth/ForgotPassword';

import { studentLinks, teacherLinks, adminLinks } from './data/dashboardLinks';

import StudentOverview from './pages/student/StudentOverview';
import MyCourses from './pages/student/MyCourses';
import LiveClasses from './pages/student/LiveClasses';
import Assignments from './pages/student/Assignments';
import Tests from './pages/student/Tests';
import Attendance from './pages/student/Attendance';
import Progress from './pages/student/Progress';
import Certificates from './pages/student/Certificates';
import AiDoubtAssistant from './pages/student/AiDoubtAssistant';
import Notifications from './pages/student/Notifications';
import Profile from './pages/student/Profile';

import TeacherOverview from './pages/teacher/TeacherOverview';
import MyBatches from './pages/teacher/MyBatches';
import CreateAssignment from './pages/teacher/CreateAssignment';
import CreateTest from './pages/teacher/CreateTest';
import UploadContent from './pages/teacher/UploadContent';
import TeacherLiveClasses from './pages/teacher/TeacherLiveClasses';
import Submissions from './pages/teacher/Submissions';
import TeacherReports from './pages/teacher/TeacherReports';

import AdminOverview from './pages/admin/AdminOverview';
import TeacherApprovals from './pages/admin/TeacherApprovals';
import StudentManagement from './pages/admin/StudentManagement';
import CourseManagement from './pages/admin/CourseManagement';
import Announcements from './pages/admin/Announcements';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admission" element={<Admission />} />
            </Route>

            {/* Public certificate verification (no navbar/footer, reachable via QR scan) */}
            <Route path="/verify/:certId" element={<VerifyCertificate />} />

            {/* Auth (student is default login/register) */}
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/teacher-login" element={<TeacherLogin />} />
            <Route path="/register-teacher" element={<TeacherRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Hidden admin login — not linked anywhere in the UI */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Student dashboard */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout links={studentLinks} roleLabel="Student" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentOverview />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="live-classes" element={<LiveClasses />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="tests" element={<Tests />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="progress" element={<Progress />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="ai-assistant" element={<AiDoubtAssistant />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Teacher dashboard */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout links={teacherLinks} roleLabel="Teacher" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<TeacherOverview />} />
              <Route path="batches" element={<MyBatches />} />
              <Route path="assignments" element={<CreateAssignment />} />
              <Route path="tests" element={<CreateTest />} />
              <Route path="content" element={<UploadContent />} />
              <Route path="live-classes" element={<TeacherLiveClasses />} />
              <Route path="submissions" element={<Submissions />} />
              <Route path="reports" element={<TeacherReports />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout links={adminLinks} roleLabel="Super Admin" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="teacher-approvals" element={<TeacherApprovals />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
