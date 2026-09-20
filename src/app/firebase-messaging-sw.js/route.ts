import { getFirebaseMessagingEnvironment } from "@/lib/env/client";

export const dynamic = "force-dynamic";

function serialize(value: string) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function GET() {
  const environment = getFirebaseMessagingEnvironment();
  const script = `
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: ${serialize(environment.apiKey)},
  projectId: ${serialize(environment.projectId)},
  messagingSenderId: ${serialize(environment.messagingSenderId)},
  appId: ${serialize(environment.appId)}
});

firebase.messaging();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requestedUrl = event.notification?.data?.FCM_MSG?.fcmOptions?.link;
  const destination = new URL(requestedUrl || "/panel", self.location.origin);
  if (destination.origin !== self.location.origin) return;
  event.waitUntil(clients.openWindow(destination.href));
});
`;

  return new Response(script.trimStart(), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
    },
  });
}
