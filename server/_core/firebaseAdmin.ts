import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ENV } from "./env";

function getFirebasePrivateKey() {
  return ENV.firebasePrivateKey.replace(/\\n/g, "\n");
}

export function hasFirebaseAdminCredentials() {
  return Boolean(
    ENV.firebaseProjectId && ENV.firebaseClientEmail && ENV.firebasePrivateKey
  );
}

export function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  if (!hasFirebaseAdminCredentials()) {
    return initializeApp({
      projectId: ENV.firebaseProjectId || undefined,
    });
  }

  return initializeApp({
    credential: cert({
      projectId: ENV.firebaseProjectId,
      clientEmail: ENV.firebaseClientEmail,
      privateKey: getFirebasePrivateKey(),
    }),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}