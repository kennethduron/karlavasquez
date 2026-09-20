"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
import { getFirebaseMessagingEnvironment } from "@/lib/env/client";

export function getFirebaseClientApp(): FirebaseApp {
  return getApps().length
    ? getApp()
    : initializeApp(getFirebaseMessagingEnvironment());
}

export async function getFirebaseMessagingClient() {
  if (!(await isSupported())) return null;
  return getMessaging(getFirebaseClientApp());
}
