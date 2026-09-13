"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyMfaAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/lib/validation/auth";

export function MfaChallengeForm({ factorId }: { factorId: string }) {
  const [state, action, pending] = useActionState(
    verifyMfaAction,
    initialAuthActionState,
  );

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      <input type="hidden" name="factorId" value={factorId} />
      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor="code">
          Código de autenticación
        </label>
        <Input
          className="text-center font-mono text-xl tracking-[0.35em]"
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="one-time-code"
          aria-invalid={Boolean(state.fieldErrors?.code)}
          required
          autoFocus
        />
        {state.fieldErrors?.code?.map((message) => (
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
        {pending ? "Verificando…" : "Verificar y continuar"}
      </Button>
    </form>
  );
}
