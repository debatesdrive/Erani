import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Firebase Configuration for DebateDrive
 */
const firebaseConfig = {
  apiKey: "AIzaSyDEHw07AIei9246iqP89zVYHrdcldKXsw4",
  authDomain: "debatedrive-7eadf.firebaseapp.com",
  projectId: "debatedrive-7eadf",
  storageBucket: "debatedrive-7eadf.firebasestorage.app",
  messagingSenderId: "859996368386",
  appId: "1:859996368386:web:bd0772085a49c821e0811b",
  measurementId: "G-R6ZEZ50JVJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper to check if config is still placeholder
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_API_KEY" && firebaseConfig.apiKey !== "";
};
