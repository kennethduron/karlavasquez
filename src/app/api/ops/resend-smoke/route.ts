import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expected = process.env.B2_SMOKE_TOKEN;
  if (!expected || request.headers.get("x-knv-smoke-token") !== expected) {
    return NextResponse.json({ status: "DENY" }, { status: 404 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromName = process.env.RESEND_FROM_NAME;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromName || !fromEmail) {
    return NextResponse.json(
      { status: "FAIL", stage: "configuration" },
      { status: 500 },
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": "knv-phase-2-4b-resend-smoke-v2",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: ["delivered@resend.dev"],
      subject: "KNV Phase 2.4B — verificación de correo",
      text: "Prueba técnica controlada de la infraestructura de correo del bufete.",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ status: "FAIL" }, { status: 502 });
  }

  return NextResponse.json({ status: "PASS", deliveryAccepted: true });
}
