import { expect, test } from "@playwright/test";

const responsiveWidths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const supabaseAuthTest =
  process.env.SUPABASE_AUTH_TEST === "true" ||
  process.env.SUPABASE_LOCAL_TEST === "true";

type MailpitMessageSummary = {
  ID?: string;
  To?: Array<{ Address?: string }>;
};

test("the conventional login alias redirects to the active Spanish route", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page).toHaveURL(/\/iniciar-sesion$/);
});

test("unauthenticated requests are redirected away from the private panel", async ({
  page,
}) => {
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/iniciar-sesion\?next=%2Fpanel$/);
});

test("login remains accessible without horizontal overflow at required breakpoints", async ({
  page,
}) => {
  for (const width of responsiveWidths) {
    await page.setViewportSize({ width, height: width < 600 ? 780 : 900 });
    await page.goto("/iniciar-sesion");
    await expect(
      page.getByRole("heading", { name: "Bienvenida" }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(
      1,
    );
    const toggle = page.getByRole("button", { name: "Mostrar contraseña" });
    const box = await toggle.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("@supabase creates an HttpOnly session, protects the shell and logs out", async ({
  page,
  context,
}) => {
  test.skip(!supabaseAuthTest, "A Supabase Auth test environment is required");
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electrónico").fill("lawyer@knv.test");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Supabase-Test-2026!");
  const sessionResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/session") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Ingresar al panel" }).click();
  const sessionResponse = await sessionResponsePromise;
  expect(sessionResponse.status(), await sessionResponse.text()).toBe(200);
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.getByText("Abogada de Prueba")).toBeVisible();

  const sessionCookie = (await context.cookies()).find(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"),
  );
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(sessionCookie?.sameSite).toBe("Lax");

  for (const width of responsiveWidths) {
    await page.setViewportSize({ width, height: width < 600 ? 780 : 900 });
    await page.goto("/panel");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `shell overflow at ${width}px`).toBeLessThanOrEqual(1);
    if (width < 768) {
      await page.getByRole("button", { name: "Abrir menú" }).click();
      await expect(
        page.getByRole("navigation", { name: "Navegación principal" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Cerrar menú" }).click();
    }
  }

  await page.locator(".crm-user-menu summary").click();
  await page.getByRole("button", { name: /cerrar sesión/i }).click();
  await expect(page).toHaveURL(/\/iniciar-sesion$/);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/iniciar-sesion/);
});

test("@supabase rejects an inactive staff profile", async ({ page }) => {
  test.skip(!supabaseAuthTest, "A Supabase Auth test environment is required");
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electrónico").fill("disabled@knv.test");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Supabase-Test-2026!");
  await page.getByRole("button", { name: "Ingresar al panel" }).click();
  await expect(page.locator(".form-message[role='alert']")).toContainText(
    "No fue posible iniciar sesión",
  );
  await expect(page).toHaveURL(/\/iniciar-sesion/);
});

test("@supabase denies an authenticated orphan without a CRM profile", async ({
  page,
  context,
}) => {
  test.skip(!supabaseAuthTest, "A Supabase Auth test environment is required");
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electrónico").fill("orphan@knv.test");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Supabase-Test-2026!");
  const sessionResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/session") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Ingresar al panel" }).click();
  const sessionResponse = await sessionResponsePromise;
  expect(sessionResponse.status()).toBe(403);
  expect(
    (await context.cookies()).some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"),
    ),
  ).toBe(false);
  await expect(page).toHaveURL(/\/iniciar-sesion/);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/iniciar-sesion/);
});

test("@supabase completes password recovery without Firebase", async ({
  page,
  request,
}) => {
  test.skip(
    process.env.SUPABASE_LOCAL_TEST !== "true",
    "The local Supabase stack is required",
  );
  const email = "recovery@knv.test";
  const newPassword = "Supabase-Recovered-2026!";

  await page.goto("/recuperar-acceso");
  await page.getByLabel("Correo electrónico institucional").fill(email);
  await page.getByRole("button", { name: "Enviar enlace seguro" }).click();
  await expect(page.locator(".form-success")).toBeVisible();

  let messageId;
  await expect
    .poll(async () => {
      const response = await request.get(
        "http://127.0.0.1:57324/api/v1/messages",
      );
      const payload = (await response.json()) as {
        messages?: MailpitMessageSummary[];
      };
      const message = payload.messages?.find((candidate) =>
        candidate.To?.some((recipient) => recipient.Address === email),
      );
      messageId = message?.ID;
      return Boolean(messageId);
    })
    .toBe(true);

  const messageResponse = await request.get(
    `http://127.0.0.1:57324/api/v1/message/${messageId}`,
  );
  const message = await messageResponse.json();
  const body = `${message.HTML ?? ""}\n${message.Text ?? ""}`;
  const recoveryLink = [...body.matchAll(/https?:\/\/[^\s"'<>]+/g)]
    .map(([value]) => value.replaceAll("&amp;", "&"))
    .find((value) => value.includes("/auth/v1/verify"));
  if (!recoveryLink) throw new Error("Recovery email did not contain a link");

  await page.goto(recoveryLink);
  await expect(page).toHaveURL(/\/actualizar-contrasena$/);
  const recoveryCookieNames = (await page.context().cookies()).map(
    ({ name }) => name,
  );
  expect(
    recoveryCookieNames.some(
      (name) =>
        name.startsWith("sb-") &&
        name.includes("auth-token") &&
        !name.includes("code-verifier"),
    ),
    `missing auth cookie; present names: ${recoveryCookieNames.join(",")}`,
  ).toBe(true);
  const protectedProbe = await page.request.get("/panel", { maxRedirects: 0 });
  expect(
    protectedProbe.status(),
    "recovery session cannot access the panel",
  ).toBe(200);
  await page.locator("input#password").fill(newPassword);
  await page.locator("input#confirmPassword").fill(newPassword);
  const updateResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/password") &&
      response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Guardar nueva contraseña" }).click();
  expect((await updateResponsePromise).status()).toBe(200);
  await expect(page).toHaveURL(/\/iniciar-sesion\?restablecida=1$/);

  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(newPassword);
  await page.getByRole("button", { name: "Ingresar al panel" }).click();
  await expect(page).toHaveURL(/\/panel$/);
});
