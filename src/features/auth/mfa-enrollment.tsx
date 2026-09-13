"use client";

import Image from "next/image";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  beginMfaEnrollmentAction,
  confirmMfaEnrollmentAction,
  type MfaEnrollmentState,
} from "@/features/auth/mfa-actions";
import { initialAuthActionState } from "@/lib/validation/auth";

const initialEnrollmentState: MfaEnrollmentState = {
  ...initialAuthActionState,
};

export function MfaEnrollment() {
  const [enrollment, beginAction, beginning] = useActionState(
    beginMfaEnrollmentAction,
    initialEnrollmentState,
  );
  const [verification, verifyAction, verifying] = useActionState(
    confirmMfaEnrollmentAction,
    initialAuthActionState,
  );

  if (!enrollment.factorId || !enrollment.qrCode) {
    return (
      <form action={beginAction}>
        {enrollment.message ? (
          <p className="form-message mb-4" role="alert">
            {enrollment.message}
          </p>
        ) : null}
        <Button disabled={beginning} type="submit">
          {beginning ? "Preparando…" : "Configurar aplicación autenticadora"}
        </Button>
      </form>
    );
  }

  return (
    <div className="mfa-enrollment-grid">
      <div className="mfa-qr-wrap">
        <Image
          src={enrollment.qrCode}
          alt="Código QR para configurar la aplicación autenticadora"
          width={220}
          height={220}
          unoptimized
        />
      </div>
      <div>
        <h3 className="font-serif text-xl">Confirme la vinculación</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#4b5563]">
          <li>Escanee el código con su aplicación autenticadora.</li>
          <li>Si no puede escanear, ingrese esta clave manualmente:</li>
        </ol>
        <code className="mfa-secret">{enrollment.secret}</code>
        <form action={verifyAction} className="mt-5 space-y-4" noValidate>
          <input type="hidden" name="factorId" value={enrollment.factorId} />
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold"
              htmlFor="enrollment-code"
            >
              Código de seis dígitos
            </label>
            <Input
              id="enrollment-code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              required
            />
            {verification.fieldErrors?.code?.map((message) => (
              <p className="field-error" key={message}>
                {message}
              </p>
            ))}
          </div>
          {verification.message ? (
            <p className="form-message" role="alert">
              {verification.message}
            </p>
          ) : null}
          <Button disabled={verifying} type="submit">
            {verifying ? "Confirmando…" : "Activar segundo factor"}
          </Button>
        </form>
      </div>
    </div>
  );
}
