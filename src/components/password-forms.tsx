"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { resetPasswordAction, solicitarResetAction } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Alert, Field, inputClass } from "@/components/ui/form";

export function SolicitarResetForm() {
  const [state, action, pending] = useActionState(solicitarResetAction, {});

  if (state.ok) {
    return (
      <div className="space-y-5">
        <Alert tone="success">
          <MailCheck className="mr-1 inline size-4" /> {state.message}
        </Alert>
        <Link href="/login" className="block text-center text-sm font-semibold text-brand-600 underline">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <Field label="Correo electrónico de tu cuenta" name="email" error={state.errors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Button type="submit" loading={pending} className="w-full" size="lg">
        Enviarme el enlace
      </Button>
      <p className="text-center text-sm text-ink-600">
        ¿Ya la recuerdas?{" "}
        <Link href="/login" className="font-semibold text-brand-600 underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <Field label="Contraseña nueva" name="password" error={state.errors?.password} hint="Mínimo 8 caracteres">
        <input id="password" name="password" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <Field label="Repite la contraseña" name="confirmPassword" error={state.errors?.confirmPassword}>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      {state.message && (
        <Alert tone="error">
          {state.message}{" "}
          <Link href="/recuperar-contrasena" className="underline">
            Pedir otro enlace
          </Link>
        </Alert>
      )}
      <Button type="submit" loading={pending} className="w-full" size="lg">
        Guardar contraseña
      </Button>
    </form>
  );
}
