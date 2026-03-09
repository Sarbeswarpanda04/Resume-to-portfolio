import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) ?? "",
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ?? "",
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) ?? "",
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined) ?? "",
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined) ?? "",
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) ?? "",
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) ?? "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Analytics is optional; only try to init in browser.
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  } catch (e) {
    console.warn('Firebase initialization failed. Auth will be disabled.', e);
    app = null;
    auth = null;
    analytics = null;
  }
} else {
  console.warn(
    'Firebase is not configured (missing VITE_FIREBASE_* env vars). Auth will be disabled.'
  );
}

export { auth, analytics };
export default app;
