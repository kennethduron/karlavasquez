import { describe, expect, it } from "vitest";

import {
  consultationContactStepSchema,
  publicContactSchema,
  publicConsultationSchema,
} from "./public-forms";

describe("public form validation", () => {
  it("accepts contact-step values independently from later steps", () => {
    expect(
      consultationContactStepSchema.safeParse({
        fullName: "Persona de Prueba",
        email: "persona@example.com",
        phone: "",
      }).success,
    ).toBe(true);
  });

  it("accepts a complete consultation draft without persisting it", () => {
    const result = publicConsultationSchema.safeParse({
      fullName: "Persona de Prueba",
      email: "persona@example.com",
      phone: "",
      practiceArea: "derecho-de-familia",
      service: "Divorcio",
      description: "Descripción general suficiente para solicitar orientación.",
      preferredContactMethod: "email",
      preferredDate: "",
      preferredTime: "morning",
      privacyConsent: true,
      website: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an orphan consultation draft without a contact method", () => {
    const result = publicConsultationSchema.safeParse({
      fullName: "Persona de Prueba",
      email: "",
      phone: "",
      practiceArea: "derecho-civil",
      service: "",
      description: "Descripción general suficiente para solicitar orientación.",
      preferredContactMethod: "email",
      preferredDate: "",
      preferredTime: "",
      privacyConsent: true,
      website: "",
    });

    expect(result.success).toBe(false);
  });

  it("requires consent and meaningful content in the contact form", () => {
    const result = publicContactSchema.safeParse({
      fullName: "P",
      email: "not-an-email",
      subject: "",
      message: "Breve",
      privacyConsent: false,
      website: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.length).toBeGreaterThanOrEqual(5);
  });
});
