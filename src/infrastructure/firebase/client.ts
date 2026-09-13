"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  inMemoryPersistence,
  setPersistence,
} from "firebase/auth";

declare global {
  var __knvFirebaseAuthEmulatorConnected: boolean | undefined;
}

function getClientConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value)) {
    throw new Error("Firebase client configuration is missing.");
  }
  return config as Record<keyof typeof config, string>;
}

export function getFirebaseClientApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(getClientConfig());
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
