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
