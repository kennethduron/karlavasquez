import { afterEach, describe, expect, it, vi } from "vitest";
import { ResendTransactionalEmail } from "./email";

describe("ResendTransactionalEmail", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("keeps provider authorization server-side and sends plain text", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_server_only");
    vi.stubEnv("RESEND_FROM_NAME", "Bufete Karla Vásquez");
    vi.stubEnv("RESEND_FROM_EMAIL", "notificaciones@example.com");
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "test" }), { status: 200 }),
      );

    await new ResendTransactionalEmail(request).send({
      to: "staff@example.com",
      subject: "Prueba segura",
      text: "Mensaje transaccional de prueba.",
    });

    const [, init] = request.mock.calls[0];
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer re_test_server_only",
    });
    expect(JSON.parse(String(init?.body))).toMatchObject({
      from: "Bufete Karla Vásquez <notificaciones@example.com>",
      to: ["staff@example.com"],
    });
  });

  it("rejects header injection before contacting the provider", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_server_only");
    vi.stubEnv("RESEND_FROM_NAME", "Bufete Karla Vásquez");
    vi.stubEnv("RESEND_FROM_EMAIL", "notificaciones@example.com");
    const request = vi.fn<typeof fetch>();
    await expect(
      new ResendTransactionalEmail(request).send({
        to: "staff@example.com\r\nBcc: attacker@example.com",
        subject: "Prueba",
        text: "Mensaje.",
      }),
    ).rejects.toThrow("Invalid recipient");
    expect(request).not.toHaveBeenCalled();
  });
});
