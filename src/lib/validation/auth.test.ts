import { describe, expect, it } from "vitest";

import {
  loginSchema,
  mfaCodeSchema,
  passwordUpdateSchema,
  safeInternalPath,
} from "@/lib/validation/auth";

describe("auth validation", () => {
  it("accepts an institutional login payload", () => {
    expect(
      loginSchema.safeParse({
        email: "equipo@knv.hn",
        password: "credencial-segura",
        next: "/panel/seguridad",
      }).success,
    ).toBe(true);
  });

  it("requires a strong matching replacement password", () => {
    expect(
      passwordUpdateSchema.safeParse({
        password: "Legal-Segura-2026!",
        confirmPassword: "Legal-Segura-2026!",
      }).success,
    ).toBe(true);
    expect(
      passwordUpdateSchema.safeParse({
        password: "weak-password",
        confirmPassword: "different",
      }).success,
    ).toBe(false);
  });

  it("accepts only six-digit MFA codes with UUID factor IDs", () => {
    expect(
      mfaCodeSchema.safeParse({
        factorId: "9b2a460e-1b35-4b14-9939-15bf96ebae6f",
        code: "123456",
      }).success,
    ).toBe(true);
    expect(
      mfaCodeSchema.safeParse({ factorId: "not-a-uuid", code: "12345x" })
        .success,
    ).toBe(false);
  });
});

describe("safeInternalPath", () => {
  it("preserves local paths and their query strings", () => {
    expect(safeInternalPath("/panel/seguridad?configurar=1")).toBe(
      "/panel/seguridad?configurar=1",
    );
  });

  it.each([
    "https://malicious.example/panel",
    "//malicious.example/panel",
    "javascript:alert(1)",
    null,
  ])("rejects an external or invalid redirect: %s", (value) => {
    expect(safeInternalPath(value)).toBe("/panel");
  });
});
