import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { getFirebaseAdminEnvironment } from "@/lib/env/server";

export function getFirebaseAdminApp() {
  if (getApps().length) return getApp();
  const environment = getFirebaseAdminEnvironment();
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (environment.emulator) {
    return initializeApp({ projectId: environment.projectId, storageBucket });
  }
  return initializeApp({
    credential: cert({
      projectId: environment.projectId,
      clientEmail: environment.clientEmail,
      privateKey: environment.privateKey,
    }),
    projectId: environment.projectId,
    storageBucket,
  });
}

export const getAdminAuth = () => getAuth(getFirebaseAdminApp());
export const getAdminFirestore = () => getFirestore(getFirebaseAdminApp());
export const getAdminStorage = () => getStorage(getFirebaseAdminApp());
