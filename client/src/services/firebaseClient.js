import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC22tcvYzBHCWUUzdp44db3GuEhtHquTb8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rachbam-cardigan.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rachbam-cardigan",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rachbam-cardigan.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "891684920424",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:891684920424:web:fae7e26ddae472993e2fdd"
};

let auth = null;
let googleProvider = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (error) {
  console.warn('Firebase Client initialization warning:', error.message);
}

export { auth, googleProvider };
