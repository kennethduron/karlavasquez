"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  inMemoryPersistence,
  setPersistence,
} from "firebase/auth";

import { getFirebaseClientEnvironment } from "@/lib/env/client";

declare global {
  var __knvFirebaseAuthEmulatorConnected: boolean | undefined;
}

export function getFirebaseClientApp(): FirebaseApp {
  return getApps().length
    ? getApp()
    : initializeApp(getFirebaseClientEnvironment());
}

export async function getFirebaseClientAuth() {
  const auth = getAuth(getFirebaseClientApp());
  await setPersistence(auth, inMemoryPersistence);
  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
    !globalThis.__knvFirebaseAuthEmulatorConnected
  ) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    globalThis.__knvFirebaseAuthEmulatorConnected = true;
  }
  return auth;
}
