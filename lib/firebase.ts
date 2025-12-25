import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase Configuration for Erani (Debate Drive)
 * Safely extracts environment variables.
 */
const getSafeEnv = (key: string): string => {
  try {
    // Vite-specific check
    const env = (import.meta as any).env;
    if (env && env[key]) return env[key];
  } catch (e) {}
  
  return '';
};

// Default fallback to your provided keys if .env is missing
const firebaseConfig = {
  apiKey: getSafeEnv('VITE_FIREBASE_API_KEY') || "AIzaSyDEHw07AIei9246iqP89zVYHrdcldKXsw4",
  authDomain: getSafeEnv('VITE_FIREBASE_AUTH_DOMAIN') || "debatedrive-7eadf.firebaseapp.com",
  projectId: getSafeEnv('VITE_FIREBASE_PROJECT_ID') || "debatedrive-7eadf",
  storageBucket: getSafeEnv('VITE_FIREBASE_STORAGE_BUCKET') || "debatedrive-7eadf.firebasestorage.app",
  messagingSenderId: getSafeEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || "859996368386",
  appId: getSafeEnv('VITE_FIREBASE_APP_ID') || "1:859996368386:web:bd0772085a49c821e0811b",
  measurementId: getSafeEnv('VITE_FIREBASE_MEASUREMENT_ID') || "G-R6ZEZ50JVJ"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    app = initializeApp({ apiKey: "none" }); // Placeholder to prevent crash
  }
} else {
  app = getApp();
}

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Helper to check if config is correctly loaded
 */
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key_here";
};