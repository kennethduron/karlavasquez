"use client";

import {
  onMessage,
  onRegistered,
  register as registerMessaging,
  unregister as unregisterMessaging,
} from "firebase/messaging";
import { BellRing, BellOff, Send } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getFirebaseMessagingClient } from "@/infrastructure/firebase/client";
import { getFirebaseMessagingEnvironment } from "@/lib/env/client";

type Status = "idle" | "working" | "enabled" | "disabled" | "unsupported";

const storageKey = "knv:fcm-fid";

async function registerBrowserIdentity() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("Este navegador no admite notificaciones web.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("El permiso de notificaciones no fue concedido.");
  }

  const environment = getFirebaseMessagingEnvironment();
  if (!environment.vapidKey) {
    throw new Error("Las notificaciones no están configuradas.");
  }

  const messaging = await getFirebaseMessagingClient();
  if (!messaging) {
    throw new Error("Este navegador no admite Firebase Cloud Messaging.");
  }

  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/" },
  );

  const fid = await new Promise<string>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      unsubscribe();
      reject(new Error("FCM no completó el registro del dispositivo."));
    }, 15_000);
    const unsubscribe = onRegistered(messaging, (registeredFid) => {
      window.clearTimeout(timeout);
      unsubscribe();
      resolve(registeredFid);
    });

    void registerMessaging(messaging, {
      serviceWorkerRegistration,
      vapidKey: environment.vapidKey,
    }).catch((error: unknown) => {
      window.clearTimeout(timeout);
      unsubscribe();
      reject(error);
    });
  });

  return { fid, messaging };
}

export function PushNotificationControl() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(
    "Activa las notificaciones únicamente en un dispositivo de confianza.",
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        setStatus("unsupported");
        setMessage("Este navegador no admite notificaciones web.");
        return;
      }
      if (
        Notification.permission === "granted" &&
        localStorage.getItem(storageKey)
      ) {
        setStatus("enabled");
        setMessage("Las notificaciones están activas en este dispositivo.");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    void getFirebaseMessagingClient().then((messaging) => {
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || "Nueva notificación KNV";
        setMessage(title);
      });
    });
    return () => unsubscribe();
  }, []);

  async function enableNotifications() {
    setStatus("working");
    setMessage("Activando notificaciones…");
    try {
      const { fid } = await registerBrowserIdentity();
      const response = await fetch("/api/push/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid,
          userAgent: navigator.userAgent.slice(0, 200),
        }),
      });
      if (!response.ok)
        throw new Error("No fue posible guardar el dispositivo.");
      localStorage.setItem(storageKey, fid);
      setStatus("enabled");
      setMessage("Las notificaciones están activas en este dispositivo.");
    } catch (error) {
      setStatus("disabled");
      setMessage(
        error instanceof Error
          ? error.message
          : "No fue posible activar las notificaciones.",
      );
    }
  }

  async function disableNotifications() {
    const fid = localStorage.getItem(storageKey);
    if (!fid) {
      setStatus("disabled");
      setMessage("No hay una suscripción activa en este navegador.");
      return;
    }

    setStatus("working");
    setMessage("Desactivando notificaciones…");
    try {
      const response = await fetch("/api/push/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid }),
      });
      if (!response.ok)
        throw new Error("No fue posible retirar el dispositivo.");
      const messaging = await getFirebaseMessagingClient();
      if (messaging) await unregisterMessaging(messaging);
      localStorage.removeItem(storageKey);
      setStatus("disabled");
      setMessage("Las notificaciones están desactivadas en este dispositivo.");
    } catch (error) {
      setStatus("enabled");
      setMessage(
        error instanceof Error
          ? error.message
          : "No fue posible desactivar las notificaciones.",
      );
    }
  }

  async function sendTest() {
    setStatus("working");
    setMessage("Enviando notificación de prueba…");
    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      if (!response.ok) throw new Error("FCM no confirmó la prueba.");
      setStatus("enabled");
      setMessage("FCM confirmó el envío de la notificación de prueba.");
    } catch (error) {
      setStatus("enabled");
      setMessage(
        error instanceof Error ? error.message : "La prueba no pudo enviarse.",
      );
    }
  }

  const disabled = status === "working" || status === "unsupported";

  return (
    <article className="security-card security-card--stacked">
      <span className="security-icon">
        {status === "enabled" ? <BellRing size={23} /> : <BellOff size={23} />}
      </span>
      <div>
        <p className="eyebrow">Notificaciones del sistema</p>
        <h2>Firebase Cloud Messaging</h2>
        <p aria-live="polite">{message}</p>
      </div>
      <div className="security-actions">
        {status !== "enabled" ? (
          <Button
            disabled={disabled}
            onClick={enableNotifications}
            type="button"
          >
            Activar en este dispositivo
          </Button>
        ) : (
          <>
            <Button disabled={disabled} onClick={sendTest} type="button">
              <Send size={16} /> Enviar prueba
            </Button>
            <Button
              disabled={disabled}
              onClick={disableNotifications}
              type="button"
              variant="secondary"
            >
              Desactivar
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
