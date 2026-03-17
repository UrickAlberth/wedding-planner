import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ENV } from "./env";

function getFirebasePrivateKey() {
  return ENV.firebasePrivateKey.replace(/\\n/g, "\n");
}

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  if (!ENV.firebaseProjectId || !ENV.firebaseClientEmail || !ENV.firebasePrivateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({
      projectId: ENV.firebaseProjectId,
      clientEmail: ENV.firebaseClientEmail,
      privateKey: getFirebasePrivateKey(),
    }),
  });
}

export const firebaseAdminApp = getFirebaseApp();
export const firebaseAdminAuth = getAuth(firebaseAdminApp);