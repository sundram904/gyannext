import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, setDoc,
  query, where, orderBy, serverTimestamp, arrayUnion,
} from 'firebase/firestore';
import { db } from './config';

/* ---------------------------------------------------------------------
 * Firestore collection map (see /FIRESTORE_SCHEMA.md for full detail)
 * users            -> profile + role (student|teacher|admin)
 * courses          -> catalog entries (category, chapters[], instructorId)
 * enrollments      -> { studentId, courseId, batchId, progress, status }
 * batches          -> { courseId, teacherId, schedule, meetLink, studentIds[] }
 * assignments       -> { batchId, teacherId, title, dueDate, attachments }
 * submissions      -> { assignmentId, studentId, fileUrl/text, grade, feedback }
 * tests            -> { batchId, type: 'mcq'|'coding', questions[] }
 * testAttempts     -> { testId, studentId, answers, score }
 * attendance       -> { batchId, date, records: { studentId: 'present'|'absent' } }
 * certificates     -> { studentId, courseId, certId, qrPayload, issuedAt }
 * announcements    -> { audience, title, body, createdAt }
 * -------------------------------------------------------------------*/

const col = (name) => collection(db, name);

export async function getAllCourses() {
  const snap = await getDocs(col('courses'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCourseById(courseId) {
  const snap = await getDoc(doc(db, 'courses', courseId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getCoursesByCategory(category) {
  const q = query(col('courses'), where('category', '==', category));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function enrollStudentInCourse(studentId, courseId, batchId = null) {
  const enrollmentRef = await addDoc(col('enrollments'), {
    studentId, courseId, batchId,
    progress: 0,
    status: 'active',
    enrolledAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', studentId), {
    enrolledCourses: arrayUnion(courseId),
  });
  return enrollmentRef.id;
}

export async function getStudentEnrollments(studentId) {
  const q = query(col('enrollments'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function submitAssignment({ assignmentId, courseId, studentId, fileUrl, text }) {
  return addDoc(col('submissions'), {
    assignmentId, courseId, studentId, fileUrl: fileUrl || null, text: text || null,
    submittedAt: serverTimestamp(),
    grade: null,
    feedback: null,
  });
}

export async function gradeSubmission(submissionId, grade, feedback) {
  return updateDoc(doc(db, 'submissions', submissionId), { grade, feedback, gradedAt: serverTimestamp() });
}

export async function createAssignment({ teacherId, teacherName, courseId, courseTitle, title, description, dueDate }) {
  return addDoc(col('assignments'), {
    teacherId, teacherName, courseId, courseTitle, title, description, dueDate,
    createdAt: serverTimestamp(),
  });
}

export async function getAssignmentsForCourses(courseIds) {
  if (!courseIds || courseIds.length === 0) return [];
  // Firestore 'in' queries support up to 30 values, which comfortably covers a student's enrollments.
  const q = query(col('assignments'), where('courseId', 'in', courseIds.slice(0, 30)));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAssignmentsByTeacher(teacherId) {
  const q = query(col('assignments'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getStudentSubmissions(studentId) {
  const q = query(col('submissions'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSubmissionsForAssignments(assignmentIds) {
  if (!assignmentIds || assignmentIds.length === 0) return [];
  const q = query(col('submissions'), where('assignmentId', 'in', assignmentIds.slice(0, 30)));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPendingTeachers() {
  const q = query(col('users'), where('role', '==', 'teacher'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllStudents() {
  const q = query(col('users'), where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllTeachers() {
  const q = query(col('users'), where('role', '==', 'teacher'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function approveTeacher(uid, adminUid) {
  return updateDoc(doc(db, 'users', uid), {
    status: 'active', approvedBy: adminUid, approvedAt: serverTimestamp(),
  });
}

export async function rejectTeacher(uid, adminUid) {
  return updateDoc(doc(db, 'users', uid), {
    status: 'rejected', approvedBy: adminUid, approvedAt: serverTimestamp(),
  });
}

export async function suspendUser(uid) {
  return updateDoc(doc(db, 'users', uid), { status: 'suspended' });
}

export async function reactivateUser(uid) {
  return updateDoc(doc(db, 'users', uid), { status: 'active' });
}

export async function submitContactMessage({ name, email, subject, message }) {
  return addDoc(col('contactMessages'), { name, email, subject, message, createdAt: serverTimestamp(), status: 'new' });
}

export async function submitAdmission(data) {
  return addDoc(col('admissions'), { ...data, createdAt: serverTimestamp(), status: 'pending' });
}

export async function getAllAdmissions() {
  const q = query(col('admissions'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllContactMessages() {
  const q = query(col('contactMessages'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function makeRoomName(courseId) {
  const clean = courseId.replace(/[^a-zA-Z0-9]/g, '');
  const rand = Math.random().toString(36).slice(2, 8);
  return `gyannext-${clean}-${Date.now()}-${rand}`;
}

export async function createLiveClass({ teacherId, teacherName, courseId, courseTitle, topic, scheduledTime }) {
  const roomName = makeRoomName(courseId);
  return addDoc(col('liveClasses'), {
    teacherId, teacherName, courseId, courseTitle, topic, scheduledTime, roomName,
    createdAt: serverTimestamp(),
  });
}

export async function getLiveClassesForCourses(courseIds) {
  if (!courseIds || courseIds.length === 0) return [];
  const q = query(col('liveClasses'), where('courseId', 'in', courseIds.slice(0, 30)));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLiveClassesByTeacher(teacherId) {
  const q = query(col('liveClasses'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteLiveClass(classId) {
  return deleteDoc(doc(db, 'liveClasses', classId));
}

export async function createTest({
  teacherId, teacherName, courseId, courseTitle, title, type = 'mcq',
  questions, problemStatement, starterCode, language, stdin, expectedOutput,
}) {
  return addDoc(col('tests'), {
    teacherId, teacherName, courseId, courseTitle, title, type,
    questions: questions || null,
    problemStatement: problemStatement || null,
    starterCode: starterCode || null,
    language: language || null,
    stdin: stdin || null,
    expectedOutput: expectedOutput || null,
    createdAt: serverTimestamp(),
  });
}

export async function getTestsForCourses(courseIds) {
  if (!courseIds || courseIds.length === 0) return [];
  const q = query(col('tests'), where('courseId', 'in', courseIds.slice(0, 30)));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTestsByTeacher(teacherId) {
  const q = query(col('tests'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function submitTestAttempt({ testId, studentId, answers, score, total }) {
  return addDoc(col('testAttempts'), {
    testId, studentId, answers, score, total, submittedAt: serverTimestamp(),
  });
}

export async function getStudentTestAttempts(studentId) {
  const q = query(col('testAttempts'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markLiveClassAttendance({ classId, courseId, courseTitle, studentId, studentName }) {
  // One attendance record per student per class — safe to call every time they join,
  // since we check for an existing record first to avoid duplicates.
  const q = query(col('attendance'), where('classId', '==', classId), where('studentId', '==', studentId));
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;
  const ref = await addDoc(col('attendance'), {
    classId, courseId, courseTitle, studentId, studentName,
    status: 'present', joinedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAttendanceForClass(classId) {
  const q = query(col('attendance'), where('classId', '==', classId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getStudentAttendance(studentId) {
  const q = query(col('attendance'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markAttendance(batchId, date, records) {
  return addDoc(col('attendance'), { batchId, date, records, createdAt: serverTimestamp() });
}

export async function addCourseContent({ courseId, courseTitle, teacherId, teacherName, type, title, fileUrl, storagePath }) {
  return addDoc(col('courseContent'), {
    courseId, courseTitle, teacherId, teacherName, type, title, fileUrl, storagePath,
    createdAt: serverTimestamp(),
  });
}

export async function getCourseContentForCourse(courseId) {
  const q = query(col('courseContent'), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCourseContentByTeacher(teacherId) {
  const q = query(col('courseContent'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Real progress = (assignments submitted + tests attempted) / (total assignments + total tests)
// for that specific course — computed live from actual Firestore records, not a stored guess.
export async function getCourseProgress(studentId, courseId) {
  const [assignments, submissions, tests, attempts] = await Promise.all([
    getAssignmentsForCourses([courseId]),
    getStudentSubmissions(studentId),
    getTestsForCourses([courseId]),
    getStudentTestAttempts(studentId),
  ]);
  const assignmentIds = new Set(assignments.map((a) => a.id));
  const testIds = new Set(tests.map((t) => t.id));
  const assignmentsDone = submissions.filter((s) => assignmentIds.has(s.assignmentId)).length;
  const testsDone = attempts.filter((a) => testIds.has(a.testId)).length;
  const total = assignments.length + tests.length;
  const done = assignmentsDone + testsDone;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { percent, assignmentsTotal: assignments.length, assignmentsDone, testsTotal: tests.length, testsDone };
}

export async function issueCertificate({ studentId, studentName, courseId, courseTitle, teacherId }) {
  const certId = `GN-${courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  await addDoc(col('certificates'), {
    studentId, studentName, courseId, courseTitle, teacherId, certId,
    issuedAt: serverTimestamp(),
  });
  return certId;
}

export async function getCertificatesForStudent(studentId) {
  const q = query(col('certificates'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCertificateByCertId(certId) {
  const q = query(col('certificates'), where('certId', '==', certId));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getCoursesTaughtByTeacher(teacherId) {
  const [assignments, tests, liveClasses] = await Promise.all([
    getAssignmentsByTeacher(teacherId), getTestsByTeacher(teacherId), getLiveClassesByTeacher(teacherId),
  ]);
  const map = {};
  [...assignments, ...tests, ...liveClasses].forEach((item) => {
    if (item.courseId) map[item.courseId] = item.courseTitle;
  });
  return Object.entries(map).map(([courseId, courseTitle]) => ({ courseId, courseTitle }));
}

export async function getStudentsEnrolledInCourse(courseId) {
  const q = query(col('enrollments'), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  const enrollments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const students = await getUsersByIds(enrollments.map((e) => e.studentId));
  return enrollments.map((e) => ({ ...e, student: students[e.studentId] }));
}

export async function getAllDocs(collectionName) {
  const snap = await getDocs(col(collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createAnnouncement({ title, body, audience, createdBy }) {
  return addDoc(col('announcements'), { title, body, audience, createdBy, createdAt: serverTimestamp() });
}

export async function getSettings() {
  const snap = await getDoc(doc(db, 'settings', 'general'));
  return snap.exists() ? snap.data() : null;
}

export async function updateSettings(data) {
  return setDoc(doc(db, 'settings', 'general'), data, { merge: true });
}

export async function getAnnouncements(audience = 'all') {
  const q = query(col('announcements'), where('audience', 'in', [audience, 'all']), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUsersByIds(uids) {
  if (!uids || uids.length === 0) return {};
  const unique = [...new Set(uids)];
  const results = await Promise.all(unique.map((uid) => getDoc(doc(db, 'users', uid))));
  const map = {};
  results.forEach((snap, i) => { if (snap.exists()) map[unique[i]] = { id: unique[i], ...snap.data() }; });
  return map;
}

export async function deleteDocument(collectionName, docId) {
  return deleteDoc(doc(db, collectionName, docId));
}
