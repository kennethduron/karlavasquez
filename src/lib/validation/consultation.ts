import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Ingrese un número de teléfono válido.")
  .max(30, "El número de teléfono es demasiado largo.")
  .regex(/^[+()\-\s\d]+$/, "El teléfono contiene caracteres no válidos.");

export const consultationIntakeSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    phone: phoneSchema.optional().or(z.literal("")),
    email: z.string().trim().email().max(254).optional().or(z.literal("")),
    practiceAreaId: z.string().uuid(),
    legalServiceId: z.string().uuid().optional().nullable(),
    initialDescription: z.string().trim().min(20).max(2_000),
    preferredContactMethod: z.enum(["whatsapp", "phone", "email"]),
    privacyConsent: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .superRefine((value, context) => {
    if (!value.phone && !value.email) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Ingrese teléfono o correo electrónico.",
      });
    }
  });

export type ConsultationIntake = z.infer<typeof consultationIntakeSchema>;
