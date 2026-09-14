"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import { formatHondurasTime } from "@/lib/honduras-time";

export function HondurasTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(new Date());

    updateTime();
    const interval = window.setInterval(updateTime, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  const formattedTime = now ? formatHondurasTime(now) : null;

  return (
    <div
      className="honduras-time"
      aria-label={
        formattedTime
          ? `Hora actual en Honduras: ${formattedTime}`
          : "Hora actual en Honduras"
      }
    >
      <Clock3 aria-hidden="true" size={14} strokeWidth={1.8} />
      <span>Honduras</span>
      <span aria-hidden="true" className="honduras-time-separator">
        ·
      </span>
      {formattedTime ? (
        <time dateTime={now?.toISOString()}>{formattedTime}</time>
      ) : (
        <span aria-hidden="true" className="honduras-time-placeholder">
          --:--
        </span>
      )}
    </div>
  );
}
