import { expect, test } from "@playwright/test";

const routes = [
  ["/", /Asesoría Legal con/],
  ["/sobre-karla", "Conozca a Karla Norin Vásquez"],
  ["/areas-de-practica", "Orientación jurídica con enfoque humano"],
  [
    "/areas-de-practica/derecho-de-familia",
    "Orientación sensible para decisiones importantes",
  ],
  ["/servicios/divorcio", "Orientación clara y confidencial sobre divorcio"],
  ["/solicitar-consulta", "Comencemos con la información esencial"],
  ["/recursos", "Información clara para orientarse mejor"],
  ["/contacto", "Estamos aquí para escucharle"],
  ["/privacidad", "Política de Privacidad"],
  ["/aviso-legal", "Aviso Legal"],
] as const;

const responsiveWidths = [
  320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1440, 1920, 2048,
];

const imagePaths = [
  "/images/knv/home-hero-legal.webp",
  "/images/knv/about-professional-approach.webp",
  "/images/knv/practice-areas-legal.webp",
  "/images/knv/family-law-guidance.webp",
  "/images/knv/divorce-legal-guidance.webp",
  "/images/knv/legal-consultation.webp",
  "/images/knv/legal-resources.webp",
  "/images/knv/legal-office-contact.webp",
  "/images/knv/notarial-civil-services.webp",
  "/images/knv/commercial-law.webp",
  "/images/knv/karla-norin-vasquez.webp",
] as const;

test("all required public routes render with shared navigation and footer", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  for (const [route, heading] of routes) {
    const response = await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(response?.status(), `${route} response`).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: heading }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: /Karla Norin Vásquez, inicio/i }).first(),
    ).toBeVisible();
    await expect(
      page.locator('[aria-label^="Hora actual en Honduras"]'),
    ).toContainText(/Honduras\s*·\s*\d{1,2}:\d{2}/);
    await expect(page.getByRole("contentinfo")).toContainText(
      "Contenido informativo general",
    );
    expect(await page.locator("body").innerText()).not.toMatch(
      /phase 2|pendiente|firestore|demostraci[oó]n|no persistence/i,
    );
  }

  expect(runtimeErrors, "browser console and page errors").toEqual([]);
});

test("official Karla portrait is visible and correctly ordered in both heroes", async ({
  page,
}) => {
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, copySelector] of [
      ["/", ".home-hero-copy"],
      ["/sobre-karla", ".page-hero-content"],
    ] as const) {
      await page.goto(route);
      const portrait = page.getByRole("img", {
        name: "Karla Norin Vásquez, abogada",
      });
      await expect(portrait).toBeVisible();
      await expect(portrait).toHaveAttribute("src", /karla-norin-vasquez/);
      await expect
        .poll(() =>
          portrait.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);

      const copy = await page.locator(copySelector).boundingBox();
      const photo = await portrait.boundingBox();
      expect(copy).not.toBeNull();
      expect(photo).not.toBeNull();
      if (width < 1152) {
        expect(
          photo!.y,
          `${route} portrait below content at ${width}px`,
        ).toBeGreaterThan(copy!.y + copy!.height - 2);
      } else {
        expect(
          photo!.x,
          `${route} portrait right of content at ${width}px`,
        ).toBeGreaterThan(copy!.x + copy!.width - 2);
      }
    }
  }
});

test("@device-profile portrait remains usable on additional Apple and Android profiles", async ({
  page,
}) => {
  for (const route of ["/", "/sobre-karla"]) {
    await page.goto(route);
    const portrait = page.getByRole("img", {
      name: "Karla Norin Vásquez, abogada",
    });
    await expect(portrait).toBeVisible();
    await expect
      .poll(() =>
        portrait.evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${route} overflow`).toBeLessThanOrEqual(1);
  }
});

test("editorial images are integrated into the primary public heroes", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".home-hero-background img")).toBeVisible();
  await expect(page.locator(".home-hero-media")).toHaveCount(0);

  const imageHeroRoutes = [
    "/sobre-karla",
    "/areas-de-practica",
    "/areas-de-practica/derecho-de-familia",
    "/servicios/divorcio",
    "/solicitar-consulta",
    "/recursos",
    "/contacto",
  ];

  for (const route of imageHeroRoutes) {
    await page.goto(route);
    await expect(page.locator(".page-hero--image")).toBeVisible();
    await expect(page.locator(".page-hero-background img")).toBeVisible();
    await expect(page.locator(".page-hero-media")).toHaveCount(0);
  }

  await page.goto("/sobre-karla");
  await expect(page.locator(".page-hero-background img")).toHaveAttribute(
    "src",
    /about-professional-approach/,
  );
});

test("every public route avoids horizontal overflow at all required breakpoints", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Full matrix runs once");
  test.setTimeout(240_000);

  for (const width of responsiveWidths) {
    await page.setViewportSize({ width, height: width < 600 ? 780 : 960 });
    for (const [route] of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${route} overflow at ${width}px`).toBeLessThanOrEqual(
        1,
      );
    }
  }
});

test("mobile navigation is keyboard-accessible and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".header-cta")).toBeHidden();
  const menu = page.getByRole("button", { name: "Abrir menú" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "Navegación móvil" }),
  ).toBeVisible();
  const menuBox = await page
    .getByRole("button", { name: "Cerrar menú" })
    .boundingBox();
  expect(menuBox?.width).toBeGreaterThanOrEqual(44);
  expect(menuBox?.height).toBeGreaterThanOrEqual(44);
  await page
    .getByRole("navigation", { name: "Navegación móvil" })
    .getByRole("link", { name: "Sobre Karla" })
    .click();
  await expect(page).toHaveURL(/\/sobre-karla$/);
  await expect(
    page.getByRole("button", { name: "Abrir menú" }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("consultation form validates three steps without claiming receipt", async ({
  page,
}) => {
  await page.goto("/solicitar-consulta");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  const fullName = page.getByLabel("Nombre completo");
  const email = page.getByLabel("Correo electrónico");
  const phone = page.locator('input[name="phone"]');
  await fullName.fill("Persona de Prueba");
  await email.fill("persona@example.com");
  await phone.fill("+504 9999-9999");
  await expect(fullName).toHaveValue("Persona de Prueba");
  await expect(email).toHaveValue("persona@example.com");
  await expect(phone).toHaveValue("+504 9999-9999");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(page.locator(".stepper")).toHaveAttribute(
    "aria-label",
    "Paso 2 de 3",
  );
  await page.getByLabel("Área de práctica").selectOption("derecho-de-familia");
  await page
    .getByLabel("Descripción general")
    .fill("Descripción general suficiente para solicitar orientación legal.");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel(/He leído el aviso de privacidad/).check();
  await page.getByRole("button", { name: /Revisar solicitud/ }).click();
  await expect(page.getByRole("status")).toContainText(
    "aún no ha recibido esta solicitud",
  );
});

test("contact form exposes honest validation-only feedback", async ({
  page,
}) => {
  await page.goto("/contacto");
  await page.getByRole("button", { name: "Revisar mensaje" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await page.getByLabel("Nombre completo").fill("Persona de Prueba");
  await page.getByLabel("Correo electrónico").fill("persona@example.com");
  await page.getByLabel("Asunto").fill("Consulta general");
  await page
    .getByLabel("Mensaje")
    .fill("Este es un mensaje general con contenido suficiente para validar.");
  await page.getByLabel("He leído el aviso de privacidad.").check();
  await page.getByRole("button", { name: "Revisar mensaje" }).click();
  await expect(page.getByRole("status")).toContainText(
    "aún no ha recibido este mensaje",
  );
});

test("official brand, social and platform assets are public", async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Asset HTTP checks run once");

  const paths = [
    "/favicon.ico",
    "/favicon-16x16.png",
    "/favicon-32x32.png",
    "/apple-touch-icon.png",
    "/images/knv/icon-192.png",
    "/images/knv/icon-512.png",
    "/images/knv/navbar-brand-icon.webp",
    "/images/knv/opengraph-1200x630.jpg",
    ...imagePaths,
  ];

  for (const path of paths) {
    const response = await request.get(path);
    expect(response.status(), `${path} status`).toBe(200);
    expect(response.headers()["content-type"], `${path} content type`).toMatch(
      /^image\//,
    );
  }

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  expect(manifest.headers()["content-type"]).toContain(
    "application/manifest+json",
  );

  await page.goto("/");
  await expect(page.locator(".public-brand-mark img").first()).toBeVisible();
  await expect(page.locator(".home-hero-background img")).toBeVisible();
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element) =>
            (element as HTMLImageElement).complete &&
            (element as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
});

test("mobile and tablet landscape layouts avoid overflow", async ({
  page,
}, testInfo) => {
  const isMobile = ["android-chromium", "iphone-webkit"].includes(
    testInfo.project.name,
  );
  const isTablet = testInfo.project.name === "ipad-webkit";
  test.skip(
    !isMobile && !isTablet,
    "Landscape runs on mobile and tablet profiles",
  );

  await page.setViewportSize(
    isTablet ? { width: 1194, height: 834 } : { width: 844, height: 390 },
  );
  for (const route of ["/", "/solicitar-consulta", "/contacto"]) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${route} landscape overflow`).toBeLessThanOrEqual(1);
  }
});

test("metadata, structured data, skip link and 404 are present", async ({
  page,
}) => {
  await page.goto("/contacto");
  await expect(page).toHaveTitle(/Contacto \| Karla Norin Vásquez/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://bufetekarlavasquez.com/contacto",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/images\/knv\/opengraph-1200x630\.jpg/,
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    "content",
    "1200",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
    "href",
    /\/favicon\.ico/,
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    /\/apple-touch-icon\.png/,
  );
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(structuredData).toContain('"@type":"LegalService"');
  expect(structuredData).not.toContain('"telephone"');
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toBeAttached();
  await page.goto("/ruta-inexistente-phase-2");
  await expect(
    page.getByRole("heading", { name: "Esta página no está disponible" }),
  ).toBeVisible();
});
