import admin from 'firebase-admin';

// Server-side Firebase Admin initialization (Only on the server)
const initFirebaseAdmin = () => {
  if (!admin.apps.length && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
  }
  return admin;
};

export const getAdminAuth = () => {
  const adminApp = initFirebaseAdmin();
  return adminApp.auth();
};

export const verifyIdToken = async (token: string) => {
  const adminApp = initFirebaseAdmin();
  return await adminApp.auth().verifyIdToken(token);
};

export default initFirebaseAdmin;
