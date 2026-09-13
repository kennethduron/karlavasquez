"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePasswordAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/lib/validation/auth";

export function PasswordUpdateForm() {
  const [state, action, pending] = useActionState(
    updatePasswordAction,
    initialAuthActionState,
  );

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor="password">
          Nueva contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-guidance"
          required
        />
        <p id="password-guidance" className="text-xs leading-5 text-[#4b5563]">
          Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.
        </p>
        {state.fieldErrors?.password?.map((message) => (
          <p className="field-error" key={message}>
            {message}
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
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          required
        />
        {state.fieldErrors?.confirmPassword?.map((message) => (
          <p className="field-error" key={message}>
            {message}
          </p>
        ))}
      </div>

      {state.message ? (
        <div className="form-message" role="alert" aria-live="polite">
          {state.message}
        </div>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Actualizando…" : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}
