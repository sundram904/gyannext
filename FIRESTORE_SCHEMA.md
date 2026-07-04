# GyanNext — Firestore Schema

This document describes the Firestore collections used by GyanNext. It mirrors the helper
functions in `src/firebase/firestore.js` and `src/firebase/auth.js`, and the access rules in
`firestore.rules`.

## `users/{uid}`
```
{
  name: string,
  email: string,
  phone: string,
  photoURL?: string,
  role: 'student' | 'teacher' | 'admin',
  status: 'active' | 'pending' | 'suspended',   // teachers start 'pending'
  createdAt: Timestamp,

  // student-only
  parentName?: string,
  parentPhone?: string,
  board?: 'CBSE' | 'Bihar Board',
  enrolledCourses?: string[],                    // array of courseId

  // teacher-only
  subjects?: string[],
  assignedBatches?: string[],                    // array of batchId
  approvedBy?: string,                            // admin uid
  approvedAt?: Timestamp,
}
```

## `courses/{courseId}`
```
{
  title, subtitle, description, category: 'school' | 'programming' | 'skill',
  instructor, instructorId, chapters: number, lessons: number,
  price: number, level, duration, rating, students,
  includes: string[],                             // e.g. ['Recorded Videos', 'Certificate']
}
```
Chapters/lessons for a course live in a subcollection: `courses/{courseId}/chapters/{chapterId}`
→ `{ title, order, lessons: [{ id, title, videoUrl, pdfUrl }] }`.

## `batches/{batchId}`
```
{ courseId, teacherId, name, schedule: string, meetLink: string, studentIds: string[] }
```

## `enrollments/{enrollmentId}`
```
{ studentId, courseId, batchId, progress: number (0-100), status: 'active'|'completed', enrolledAt }
```

## `liveClasses/{classId}`
```
{ teacherId, teacherName, courseId, courseTitle, topic, scheduledTime, roomName, createdAt }
```
`roomName` is auto-generated when a teacher schedules a class and maps to a Jitsi Meet room —
the class is embedded directly on the site (see `src/components/live/LiveClassRoom.jsx`); no
external Meet link is ever pasted in or out.

## `assignments/{assignmentId}`
```
{ batchId, teacherId, title, description, dueDate, attachments: string[], createdAt }
```

## `submissions/{submissionId}`
```
{ assignmentId, studentId, fileUrl?, text?, submittedAt, grade?, feedback?, gradedAt? }
```

## `tests/{testId}`
```
{ batchId, teacherId, title, type: 'mcq' | 'coding', questions: [...], createdAt }
```

## `testAttempts/{attemptId}`
```
{ testId, studentId, answers: {}, score, submittedAt }
```

## `attendance/{recordId}`
```
{ batchId, date, records: { [studentId]: 'present' | 'absent' }, createdAt }
```

## `certificates/{certId}`
```
{ studentId, courseId, certId, qrPayload: string, issuedAt }
```
Publicly readable (no auth) so a QR scan can hit `/verify/{certId}` and confirm authenticity.

## `announcements/{postId}`
```
{ title, body, audience: 'all' | 'student' | 'teacher', createdAt }
```

## `admissions/{applicationId}` and `contactMessages/{msgId}`
Write-only from the public site (admission form / contact form); readable only by admins.

---

### Notes on production hardening
- All Storage uploads (assignments, videos, notes, documents) should be written to paths like
  `content/{courseId}/{chapterId}/{fileName}` and `submissions/{studentId}/{assignmentId}/{fileName}`,
  with matching Storage security rules restricting write access by role/uid.
- Coding tests should be executed server-side (Cloud Function → sandboxed judge such as Judge0),
  never evaluated client-side.
- Certificate PDF generation + QR codes should be produced by a Cloud Function triggered when
  a student's course progress hits 100%, using a library like `pdf-lib` and storing the QR
  payload as `https://gyannext.com/verify/{certId}`.
