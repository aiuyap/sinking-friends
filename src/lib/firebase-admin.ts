import admin from 'firebase-admin';

// Server-side Firebase Admin initialization (Only on the server)
const initFirebaseAdmin = () => {
  console.log('[Firebase Admin] Checking initialization...');
  console.log('[Firebase Admin] Env vars:', {
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
    privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30),
    appsLength: admin.apps.length
  });
  
  if (!admin.apps.length && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      console.log('[Firebase Admin] Initializing...');
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      console.log('[Firebase Admin] Private key formatted, length:', privateKey.length);
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
      console.log('[Firebase Admin] ✅ Initialized successfully!');
    } catch (error) {
      console.error('[Firebase Admin] ❌ Initialization failed:', error);
      throw error;
    }
  } else {
    console.log('[Firebase Admin] Already initialized or missing env vars');
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
