"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordRecoveryAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/lib/validation/auth";

export function RecoveryForm() {
  const [state, action, pending] = useActionState(
    requestPasswordRecoveryAction,
    initialAuthActionState,
  );

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
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
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
          required
        />
        {state.fieldErrors?.email?.map((message) => (
          <p className="field-error" id="email-error" key={message}>
            {message}
          </p>
        ))}
      </div>

      {state.message ? (
        <div
          className={
            state.status === "success" ? "form-success" : "form-message"
          }
          role="status"
          aria-live="polite"
        >
          {state.message}
        </div>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Enviando…" : "Enviar enlace seguro"}
      </Button>
    </form>
  );
}
