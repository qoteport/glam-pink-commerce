import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhvH2-yfcJxufy8OHW9XqT8dvkEWXLd3c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shophairytalesbeautyhome.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shophairytalesbeautyhome",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shophairytalesbeautyhome.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "727314616784",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:727314616784:web:b834bb6c137a56eba6a9d5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GCBR554BHY"
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase SDKs for products you want to use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (supported in browser environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked
  });
}

export default app;
