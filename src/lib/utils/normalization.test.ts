import { describe, expect, it } from "vitest";

import {
  normalizeEmail,
  normalizePhone,
  normalizeSearchName,
  slugify,
} from "./normalization";

describe("normalization", () => {
  it("normalizes email without changing the display value", () => {
    expect(normalizeEmail(" Karla@Example.COM ")).toBe("karla@example.com");
  });

  it("normalizes Honduras and international phone numbers", () => {
    expect(normalizePhone("9876-5432")).toBe("+50498765432");
    expect(normalizePhone("+1 (305) 555-0199")).toBe("+13055550199");
  });

  it("creates accent-insensitive search values and slugs", () => {
    expect(normalizeSearchName("  María   Vásquez ")).toBe("maria vasquez");
    expect(slugify("Derecho Notarial")).toBe("derecho-notarial");
  });
});
