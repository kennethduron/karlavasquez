"use client";

import { useState, type FormEvent } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFirebaseClientAuth } from "@/infrastructure/firebase/client";
import { passwordUpdateSchema } from "@/lib/validation/auth";

export function PasswordUpdateForm({ oobCode }: { oobCode?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = passwordUpdateSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    if (!oobCode) {
      setMessage("El enlace no es válido o ya expiró.");
      return;
    }
    setPending(true);
    setErrors({});
    try {
      const auth = await getFirebaseClientAuth();
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, parsed.data.password);
      router.replace("/iniciar-sesion?restablecida=1");
    } catch {
      setMessage("El enlace no es válido o ya expiró. Solicite uno nuevo.");
      setPending(false);
    }
  }

  return (
    <form className="mt-7 space-y-5" noValidate onSubmit={submit}>
      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor="password">
          Nueva contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          required
        />
        <p className="text-xs leading-5 text-[#4b5563]">
          Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.
        </p>
        {errors.password?.map((error) => (
          <p className="field-error" key={error}>
            {error}
          </p>
        ))}
      </div>
      <div className="space-y-2">
        <label
          className="block text-sm font-semibold"
          htmlFor="confirmPassword"
        >
          Confirmar contraseña
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          required
        />
        {errors.confirmPassword?.map((error) => (
          <p className="field-error" key={error}>
            {error}
          </p>
        ))}
      </div>
      {message ? (
        <p className="form-message" role="alert">
          {message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Actualizando…" : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}
