const admin = require('firebase-admin');

const initFirebase = () => {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('⚠️  Firebase not configured — push notifications will be disabled');
    return null;
  }

  if (admin.apps.length > 0) return admin;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  console.log('✅ Firebase Admin initialized');
  return admin;
};

module.exports = initFirebase;
