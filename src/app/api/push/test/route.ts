import { getServerSession } from "@/lib/auth/session";
import { sendPushNotificationToUser } from "@/infrastructure/firebase/messaging";
import { getSiteUrl } from "@/lib/env/server";

export async function POST() {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = await sendPushNotificationToUser(session.uid, {
    title: "Prueba de notificaciones KNV",
    body: "La configuración FCM funciona correctamente.",
    link: `${getSiteUrl()}/panel/seguridad`,
  });

  if (result.targetCount === 0) {
    return Response.json(
      { error: "No hay un dispositivo activo para esta cuenta." },
      { status: 409 },
    );
  }

  if (result.successCount === 0) {
    return Response.json(
      { error: "FCM no confirmó la entrega de la prueba." },
      { status: 502 },
    );
  }

  return Response.json({ delivered: true });
}
