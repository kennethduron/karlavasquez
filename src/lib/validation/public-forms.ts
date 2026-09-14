import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .email("Ingrese un correo electrónico válido.")
  .max(254)
  .or(z.literal(""));

const optionalPhone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\-\s\d]*$/, "Ingrese un teléfono válido.");

export const consultationContactStepSchema = z
  .object({
    fullName: z.string().trim().min(2, "Ingrese su nombre completo.").max(120),
    email: optionalEmail,
    phone: optionalPhone,
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Ingrese correo electrónico o teléfono.",
      });
    }
  });

export const consultationMatterStepSchema = z.object({
  practiceArea: z.string().min(1, "Seleccione un área de práctica."),
  service: z.string().max(120),
  description: z
    .string()
    .trim()
    .min(20, "Describa brevemente su situación (mínimo 20 caracteres).")
    .max(2_000),
});

export const publicConsultationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Ingrese su nombre completo.").max(120),
    email: optionalEmail,
    phone: optionalPhone,
    practiceArea: z.string().min(1, "Seleccione un área de práctica."),
    service: z.string().max(120),
    description: z
      .string()
      .trim()
      .min(20, "Describa brevemente su situación (mínimo 20 caracteres).")
      .max(2_000),
    preferredContactMethod: z.enum(["email", "phone"]),
    preferredDate: z.string().max(20),
    preferredTime: z.string().max(20),
    privacyConsent: z.boolean().refine((value) => value, {
      message: "Debe aceptar el aviso de privacidad para continuar.",
    }),
    website: z.string().max(0),
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Ingrese correo electrónico o teléfono.",
      });
    }
    if (value.preferredContactMethod === "email" && !value.email) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Ingrese un correo para elegir este método.",
      });
    }
    if (value.preferredContactMethod === "phone" && !value.phone) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Ingrese un teléfono para elegir este método.",
      });
    }
  });

export const publicContactSchema = z.object({
  fullName: z.string().trim().min(2, "Ingrese su nombre completo.").max(120),
  email: z
    .string()
    .trim()
    .email("Ingrese un correo electrónico válido.")
    .max(254),
  subject: z.string().trim().min(3, "Ingrese el asunto.").max(120),
  message: z
    .string()
    .trim()
    .min(20, "Escriba un mensaje de al menos 20 caracteres.")
    .max(2_000),
  privacyConsent: z.boolean().refine((value) => value, {
    message: "Debe aceptar el aviso de privacidad.",
  }),
  website: z.string().max(0),
});

export type PublicConsultationInput = z.infer<typeof publicConsultationSchema>;
export type PublicContactInput = z.infer<typeof publicContactSchema>;
