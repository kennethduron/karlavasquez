"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/lib/validation/auth";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, action, pending] = useActionState(
    loginAction,
    initialAuthActionState,
  );

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      <input type="hidden" name="next" value={nextPath ?? "/panel"} />

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor="email">
          Correo electrónico
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
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

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label className="block text-sm font-semibold" htmlFor="password">
            Contraseña
          </label>
          <Link className="auth-link text-sm" href="/recuperar-acceso">
            ¿Olvidó su contraseña?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          required
        />
        {state.fieldErrors?.password?.map((message) => (
          <p className="field-error" id="password-error" key={message}>
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
        {pending ? "Verificando…" : "Ingresar al panel"}
      </Button>
    </form>
  );
}
