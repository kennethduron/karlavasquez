import { expect, test } from "@playwright/test";

const responsiveWidths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

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

test("@firebase creates an HttpOnly session, protects the shell and logs out", async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.FIRESTORE_EMULATOR_HOST,
    "Firebase emulators are required",
  );
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electrónico").fill("lawyer@knv.test");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Legal-Segura-2026!");
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
    (cookie) => cookie.name === "knv_session",
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

test("@firebase rejects a disabled Firebase Authentication account", async ({
  page,
}) => {
  test.skip(
    !process.env.FIRESTORE_EMULATOR_HOST,
    "Firebase emulators are required",
  );
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electrónico").fill("disabled@knv.test");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Legal-Segura-2026!");
  await page.getByRole("button", { name: "Ingresar al panel" }).click();
  await expect(page.locator(".form-message[role='alert']")).toContainText(
    "No fue posible iniciar sesión",
  );
  await expect(page).toHaveURL(/\/iniciar-sesion/);
});

test("@firebase denies an authenticated orphan without a CRM profile", async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.FIRESTORE_EMULATOR_HOST,
    "Firebase emulators are required",
  );
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electrónico").fill("orphan@knv.test");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Legal-Segura-2026!");
  const sessionResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/session") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Ingresar al panel" }).click();
  const sessionResponse = await sessionResponsePromise;
  expect(sessionResponse.status()).toBe(403);
  expect(
    (await context.cookies()).some((cookie) => cookie.name === "knv_session"),
  ).toBe(false);
  await expect(page).toHaveURL(/\/iniciar-sesion/);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/iniciar-sesion/);
});
