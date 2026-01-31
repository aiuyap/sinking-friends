import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import { getAuth as getClientAuth, GoogleAuthProvider } from 'firebase/auth';
import admin from 'firebase-admin';

// Client-side Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize client-side Firebase app
const clientApp = getClientApps().length === 0 
  ? initializeClientApp(firebaseConfig) 
  : getClientApps()[0];

// Initialize admin-side Firebase app for server-side operations
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

// Client-side auth
export const auth = getClientAuth(clientApp);
export const googleProvider = new GoogleAuthProvider();

// Server-side auth for token verification
export const adminAuth = admin.auth();

export default clientApp;