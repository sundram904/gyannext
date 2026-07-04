// Firebase app initialization.
// All values come from environment variables so real keys are never committed.
// Copy .env.example to .env and fill in your Firebase project credentials.
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyB6O8IVq1c3enK1BexXedEk2BbvL5hB3DM",
  authDomain: "gyannext-1aefe.firebaseapp.com",
  databaseURL: "https://gyannext-1aefe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gyannext-1aefe",
  storageBucket: "gyannext-1aefe.firebasestorage.app",
  messagingSenderId: "651345389541",
  appId: "1:651345389541:web:cd53f1b451516554e5310c",
  measurementId: "G-ZNC1R42LZP"
};


const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;
