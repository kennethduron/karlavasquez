"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFirebaseClientAuth } from "@/infrastructure/firebase/client";
import { loginSchema, safeInternalPath } from "@/lib/validation/auth";

const GENERIC_ERROR =
  "No fue posible iniciar sesión. Revise sus datos o solicite recuperar el acceso.";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(undefined);
    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: nextPath,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setPending(false);
      return;
    }
    setFieldErrors({});
    try {
      const auth = await getFirebaseClientAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        parsed.data.email,
        parsed.data.password,
      );
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      await signOut(auth);
      if (!response.ok) throw new Error("Session exchange failed");
      router.replace(safeInternalPath(nextPath));
      router.refresh();
    } catch {
      setMessage(GENERIC_ERROR);
      setPending(false);
    }
  }

  return (
    <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit}>
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
          aria-invalid={Boolean(fieldErrors.email)}
          required
        />
        {fieldErrors.email?.map((error) => (
          <p className="field-error" key={error}>
            {error}
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
        <div className="relative">
          <Input
            className="pr-12"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            required
          />
          <button
            className="absolute inset-y-0 right-0 grid min-h-11 w-12 place-items-center text-[#4b5563]"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password?.map((error) => (
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
        {pending ? "Verificando…" : "Ingresar al panel"}
      </Button>
    </form>
  );
}
