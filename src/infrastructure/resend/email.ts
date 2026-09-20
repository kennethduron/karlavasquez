import "server-only";

import type { TransactionalEmailPort } from "@/domain/integration-ports";
import { getResendEnvironment } from "@/lib/env/server";

type Fetch = typeof fetch;

function normalizeHeader(value: string, maxLength: number) {
  const normalized = value.replace(/[\r\n]/g, " ").trim();
  if (!normalized || normalized.length > maxLength) {
    throw new Error("Invalid email header.");
  }
  return normalized;
}

export class ResendTransactionalEmail implements TransactionalEmailPort {
  constructor(private readonly request: Fetch = fetch) {}

  async send(message: { to: string; subject: string; text: string }) {
    const environment = getResendEnvironment();
    const to = normalizeHeader(message.to, 254);
    const subject = normalizeHeader(message.subject, 200);
    if (!/^\S+@\S+\.\S+$/.test(to)) throw new Error("Invalid recipient.");
    if (!message.text.trim() || message.text.length > 100_000) {
      throw new Error("Invalid email body.");
    }

    const response = await this.request("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${environment.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        from: `${normalizeHeader(environment.fromName, 100)} <${environment.fromEmail}>`,
        to: [to],
        subject,
        text: message.text,
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Transactional email delivery failed.");
  }
}
