import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * users/{uid} schema:
 * {
 *   name, email, role: 'student' | 'teacher' | 'admin',
 *   photoURL, phone,
 *   status: 'active' | 'pending' | 'suspended',   // teachers start 'pending' until admin approval
 *   createdAt, emailVerified
 *   // student-only:
 *   parentName, parentPhone, board, classLevel, enrolledCourses: [courseId],
 *   // teacher-only:
 *   subjects: [string], assignedBatches: [batchId], approvedBy, approvedAt
 * }
 */

export async function registerStudent({ name, email, password, phone, parentName, parentPhone }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'users', cred.user.uid), {
    name, email, phone, parentName, parentPhone,
    role: 'student',
    status: 'active',
    enrolledCourses: [],
    createdAt: serverTimestamp(),
  });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function registerTeacher({ name, email, password, phone, subjects }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'users', cred.user.uid), {
    name, email, phone, subjects,
    role: 'teacher',
    status: 'pending', // requires admin approval before teacher can log into dashboard
    assignedBatches: [],
    createdAt: serverTimestamp(),
  });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(cred.user.uid);
  return { user: cred.user, profile };
}

export async function logout() {
  return signOut(auth);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
