"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { mfaCodeSchema, type AuthActionState } from "@/lib/validation/auth";

export type MfaEnrollmentState = AuthActionState & {
  factorId?: string;
  qrCode?: string;
  secret?: string;
};

export async function beginMfaEnrollmentAction(
  previousState: MfaEnrollmentState,
  formData: FormData,
): Promise<MfaEnrollmentState> {
  void previousState;
  void formData;
  await requireAuthContext({ enforceMfa: false });
  const supabase = await createClient();
  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();
  if (factorsError) {
    return {
      status: "error",
      message: "No fue posible comprobar los factores registrados.",
    };
  }
  if (factors?.totp.some((factor) => factor.status === "verified")) {
    return { status: "error", message: "La cuenta ya tiene MFA configurado." };
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "KNV CRM",
  });
  if (error) {
    return {
      status: "error",
      message: "No fue posible iniciar la configuración.",
    };
  }

  return {
    status: "success",
    message: "Escanee el código y confirme con el número generado.",
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

export async function confirmMfaEnrollmentAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  await requireAuthContext({ enforceMfa: false });
  const parsed = mfaCodeSchema.safeParse({
    factorId: formData.get("factorId"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise el código indicado.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) {
    return { status: "error", message: "El código no es válido o ya expiró." };
  }

  await supabase.rpc("record_auth_event", {
    event_action: "auth.mfa_enrolled",
  });
  revalidatePath("/panel", "layout");
  redirect("/panel/seguridad?configurada=1");
}

export async function removeMfaFactorAction(formData: FormData) {
  const context = await requireAuthContext({ enforceMfa: false });
  if (context.profile.mfaRequired) {
    redirect("/panel/seguridad?error=mfa-requerido");
  }

  const parsed = mfaCodeSchema.pick({ factorId: true }).safeParse({
    factorId: formData.get("factorId"),
  });
  if (!parsed.success) redirect("/panel/seguridad?error=factor-invalido");

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.unenroll({
    factorId: parsed.data.factorId,
  });
  if (error) redirect("/panel/seguridad?error=no-eliminado");

  await supabase.rpc("record_auth_event", { event_action: "auth.mfa_removed" });
  revalidatePath("/panel", "layout");
  redirect("/panel/seguridad?eliminada=1");
}
