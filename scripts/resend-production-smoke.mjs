const confirmation = process.argv.includes("--confirm-phase-smoke");
const required = ["RESEND_API_KEY", "RESEND_FROM_NAME", "RESEND_FROM_EMAIL"];

if (!confirmation) {
  throw new Error("Explicit phase smoke confirmation flag is required.");
}

if (!required.every((name) => Boolean(process.env[name]))) {
  throw new Error("Resend production configuration is incomplete.");
}

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
    "Idempotency-Key": "knv-phase-2-4b-resend-smoke-v1",
  },
  body: JSON.stringify({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to: ["delivered@resend.dev"],
    subject: "KNV Phase 2.4B — verificación de correo",
    text: "Prueba técnica controlada de la infraestructura de correo del bufete.",
  }),
});

if (!response.ok) {
  throw new Error(`Resend smoke failed with HTTP ${response.status}.`);
}

console.log("RESEND_RUNTIME: PASS");
