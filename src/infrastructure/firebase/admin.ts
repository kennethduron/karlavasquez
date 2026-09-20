import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

import { getFirebaseMessagingAdminEnvironment } from "@/lib/env/server";

export function getFirebaseAdminApp() {
  if (getApps().length) return getApp();
  const environment = getFirebaseMessagingAdminEnvironment();
  return initializeApp({
    credential: cert({
      projectId: environment.projectId,
      clientEmail: environment.clientEmail,
      privateKey: environment.privateKey,
    }),
    projectId: environment.projectId,
  });
}

export const getAdminMessaging = () => getMessaging(getFirebaseAdminApp());
