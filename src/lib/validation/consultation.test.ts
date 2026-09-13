import { describe, expect, it } from "vitest";

import { consultationIntakeSchema } from "./consultation";

const validRequest = {
  fullName: "Persona de prueba",
  phone: "+504 9999-9999",
  email: "",
  practiceAreaId: "53d7d57d-e758-4321-bf6b-2bb09abed420",
  legalServiceId: null,
  initialDescription:
    "Descripción inicial suficiente para solicitar orientación.",
  preferredContactMethod: "whatsapp" as const,
  privacyConsent: true as const,
  website: "",
};

describe("consultation intake validation", () => {
  it("accepts a minimal privacy-conscious request", () => {
    expect(consultationIntakeSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects requests without a contact channel", () => {
    const result = consultationIntakeSchema.safeParse({
      ...validRequest,
      phone: "",
      email: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    const result = consultationIntakeSchema.safeParse({
      ...validRequest,
      website: "spam.example",
    });
    expect(result.success).toBe(false);
  });
});
