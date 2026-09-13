import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingrese un correo electrónico válido.").trim().max(254),
  password: z.string().min(8, "Ingrese su contraseña.").max(200),
  next: z.string().optional(),
});

export const passwordRecoverySchema = z.object({
  email: z.email("Ingrese un correo electrónico válido.").trim().max(254),
});

export const passwordUpdateSchema = z
  .object({
    password: z
      .string()
      .min(12, "Use al menos 12 caracteres.")
      .max(200)
      .regex(/[a-z]/, "Incluya una letra minúscula.")
      .regex(/[A-Z]/, "Incluya una letra mayúscula.")
      .regex(/[0-9]/, "Incluya un número.")
      .regex(/[^a-zA-Z0-9]/, "Incluya un símbolo."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const mfaCodeSchema = z.object({
  factorId: z.uuid("El factor de seguridad no es válido."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Ingrese el código de seis dígitos."),
});

export function safeInternalPath(value: unknown, fallback = "/panel") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const url = new URL(value, "http://knv.local");
    if (url.origin !== "http://knv.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialAuthActionState: AuthActionState = { status: "idle" };
