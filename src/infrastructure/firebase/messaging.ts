import "server-only";

import type { Message } from "firebase-admin/messaging";

import { getAdminMessaging } from "@/infrastructure/firebase/admin";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server";

export type PushNotification = {
  title: string;
  body: string;
  link: string;
};

export async function sendPushNotificationToUser(
  userId: string,
  notification: PushNotification,
  options: { dryRun?: boolean } = {},
) {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("push_subscriptions")
    .select("token")
    .eq("user_id", userId)
    .eq("enabled", true)
    .limit(20);

  if (error) throw new Error("Push subscriptions are unavailable.");

  const fids = (data ?? [])
    .map(({ token }) => token)
    .filter((token): token is string => typeof token === "string");

  if (fids.length === 0) {
    return { targetCount: 0, successCount: 0, failureCount: 0 };
  }

  const messages: Message[] = fids.map((fid) => ({
    fid,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    webpush: {
      fcmOptions: { link: notification.link },
      notification: {
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "knv-system",
      },
    },
  }));

  const response = await getAdminMessaging().sendEach(
    messages,
    options.dryRun ?? false,
  );

  return {
    targetCount: fids.length,
    successCount: response.successCount,
    failureCount: response.failureCount,
  };
}
