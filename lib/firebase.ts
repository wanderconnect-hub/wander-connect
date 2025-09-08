// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Debug: log all env variables Vite provides
console.log("🔥 Full import.meta.env:", import.meta.env);

// Build Firebase config from .env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: log config before initializing Firebase
console.log("👉 Firebase Config:", firebaseConfig);

// Extra safeguard: throw error if projectId is missing
if (!firebaseConfig.projectId) {
  throw new Error("❌ Firebase projectId is missing. Check your .env file and restart the dev server.");
}

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
