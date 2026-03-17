import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) ??
    "AIzaSyBKzaJPdMdNnvoYeulD_bHrHNKcT4TvPBI",
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ??
    "casamento-89306.firebaseapp.com",
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) ??
    "casamento-89306",
  storageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined) ??
    "casamento-89306.firebasestorage.app",
  messagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined) ??
    "497863718200",
  appId:
    (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) ??
    "1:497863718200:web:4eb708fa64163b79763dcd",
  measurementId:
    (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) ??
    "G-E4Q7ZY6DEM",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);