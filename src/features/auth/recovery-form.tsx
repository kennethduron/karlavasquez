"use client";

import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFirebaseClientAuth } from "@/infrastructure/firebase/client";
import { passwordRecoverySchema } from "@/lib/validation/auth";

const GENERIC_SUCCESS =
  "Si existe una cuenta autorizada, recibirá un enlace para restablecer el acceso.";

export function RecoveryForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [fieldError, setFieldError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const parsed = passwordRecoverySchema.safeParse({
      email: formData.get("email"),
    });
    if (!parsed.success) {
      setFieldError(parsed.error.flatten().fieldErrors.email?.[0]);
      setPending(false);
      return;
    }
    setFieldError(undefined);
    try {
      const auth = await getFirebaseClientAuth();
      await sendPasswordResetEmail(auth, parsed.data.email, {
        url: `${window.location.origin}/iniciar-sesion?restablecida=1`,
        handleCodeInApp: false,
      });
    } catch {
      // Deliberately indistinguishable to prevent account enumeration.
    }
    setMessage(GENERIC_SUCCESS);
    setPending(false);
  }

  return (
    <form className="mt-7 space-y-5" noValidate onSubmit={submit}>
      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor="email">
          Correo electrónico institucional
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldError)}
          required
        />
        {fieldError ? <p className="field-error">{fieldError}</p> : null}
      </div>
      {message ? (
        <p className="form-success" role="status">
          {message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Enviando…" : "Enviar enlace seguro"}
      </Button>
    </form>
  );
}
