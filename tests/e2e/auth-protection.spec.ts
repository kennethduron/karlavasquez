import { expect, test } from "@playwright/test";

test("unauthenticated requests are redirected away from the private panel", async ({
  request,
}) => {
  const response = await request.get("/panel", {
    maxRedirects: 0,
    headers: { connection: "close" },
  });

  expect([307, 308]).toContain(response.status());
  expect(response.headers().location).toBe("/iniciar-sesion?next=%2Fpanel");
  await response.dispose();
});

test("login is responsive and does not expose public registration", async ({
  page,
}) => {
  await page.goto("/iniciar-sesion");
  await expect(page.getByRole("heading", { name: "Bienvenida" })).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /olvidó su contraseña/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /registr/i })).toHaveCount(0);
});

test("password recovery keeps account existence private", async ({ page }) => {
  await page.goto("/recuperar-acceso");
  await expect(
    page.getByRole("heading", { name: "Restablecer acceso" }),
  ).toBeVisible();
  await page
    .getByLabel("Correo electrónico institucional")
    .fill("persona@example.com");
  await page.getByRole("button", { name: "Enviar enlace seguro" }).click();
  await expect(
    page.getByText(/si existe una cuenta autorizada/i),
  ).toBeVisible();
});
