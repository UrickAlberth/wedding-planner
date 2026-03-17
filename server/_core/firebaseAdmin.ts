import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ENV } from "./env";

function getFirebasePrivateKey() {
  const raw = ENV.firebasePrivateKey.trim();
  const withoutWrappingQuotes = raw.replace(/^"|"$/g, "");
  return withoutWrappingQuotes.replace(/\\n/g, "\n");
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

  try {
    return initializeApp({
      credential: cert({
        projectId: ENV.firebaseProjectId,
        clientEmail: ENV.firebaseClientEmail,
        privateKey: getFirebasePrivateKey(),
      }),
    });
  } catch (error) {
    console.error("[firebase-admin] Failed to initialize with service account. Falling back to project-only app.", error);
    return initializeApp({
      projectId: ENV.firebaseProjectId || undefined,
    });
  }
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}