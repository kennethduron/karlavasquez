"use server";

import { redirect } from "next/navigation";

import { getSiteUrl } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  mfaCodeSchema,
  passwordRecoverySchema,
  passwordUpdateSchema,
  safeInternalPath,
  type AuthActionState,
} from "@/lib/validation/auth";

const GENERIC_LOGIN_ERROR =
  "No fue posible iniciar sesión. Revise sus datos o solicite recuperar el acceso.";

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise los campos indicados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return {
      status: "error",
      message: "El acceso todavía no está conectado al entorno seguro.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  await supabase.rpc("record_auth_event", { event_action: "auth.login" });

  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError) {
    await supabase.auth.signOut();
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }
  if (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
    redirect("/verificar-mfa");
  }

  redirect(safeInternalPath(parsed.data.next));
}

export async function requestPasswordRecoveryAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordRecoverySchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise el correo indicado.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/actualizar-contrasena`,
    });
  } catch {
    // Keep the response indistinguishable to prevent account enumeration.
  }

  return {
    status: "success",
    message:
      "Si existe una cuenta autorizada, recibirá un enlace para restablecer el acceso.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordUpdateSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "La nueva contraseña no cumple los requisitos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return {
      status: "error",
      message: "El entorno seguro no está disponible.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: "error",
      message: "El enlace expiró. Solicite uno nuevo.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return {
      status: "error",
      message:
        "No fue posible actualizar la contraseña. Solicite un enlace nuevo.",
    };
  }

  await supabase.rpc("record_auth_event", {
    event_action: "auth.password_changed",
  });
  await supabase.auth.signOut({ scope: "global" });
  redirect("/iniciar-sesion?actualizada=1");
}

export async function verifyMfaAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/iniciar-sesion");

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: parsed.data.factorId,
    code: parsed.data.code,
  });
  if (error) {
    return {
      status: "error",
      message: "El código no es válido o ya expiró.",
    };
  }

  await supabase.rpc("record_auth_event", {
    event_action: "auth.mfa_verified",
  });
  redirect("/panel");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.rpc("record_auth_event", { event_action: "auth.logout" });
  await supabase.auth.signOut();
  redirect("/iniciar-sesion");
}
