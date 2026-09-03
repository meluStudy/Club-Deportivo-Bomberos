"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert, Field, inputClass } from "@/components/ui/form";

export function LoginForm({ next, restablecida }: { next?: string; restablecida?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      {restablecida && <Alert tone="success">Contraseña actualizada. Ya puedes entrar con la nueva.</Alert>}
      <Field label="Correo electrónico" name="email" error={state.errors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Contraseña" name="password" error={state.errors?.password}>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <p className="-mt-2 text-right">
        <Link href="/recuperar-contrasena" className="text-sm text-ink-600 underline hover:text-brand-600">
          He olvidado mi contraseña
        </Link>
      </p>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Button type="submit" loading={pending} className="w-full" size="lg">Entrar</Button>
      <p className="text-center text-sm text-ink-600">
        ¿No tienes cuenta?{" "}
        <Link href={`/registro${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-600 underline">Regístrate</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerAction, {});
  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Nombre y apellidos" name="name" error={state.errors?.name}>
        <input id="name" name="name" autoComplete="name" required className={inputClass} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Correo electrónico" name="email" error={state.errors?.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field label="Teléfono (opcional)" name="phone" error={state.errors?.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contraseña" name="password" error={state.errors?.password} hint="Mínimo 8 caracteres">
          <input id="password" name="password" type="password" autoComplete="new-password" required className={inputClass} />
        </Field>
        <Field label="Repite la contraseña" name="confirmPassword" error={state.errors?.confirmPassword}>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className={inputClass} />
        </Field>
      </div>
      <label className="flex items-start gap-3 text-sm text-ink-700">
        <input type="checkbox" name="isFirefighter" className="mt-1 size-4 accent-brand-600" />
        <span>Soy miembro del Cuerpo de Bomberos del Ayuntamiento de Madrid (en activo o jubilado)</span>
      </label>
      <label className="flex items-start gap-3 text-sm text-ink-700">
        <input type="checkbox" name="acceptTerms" className="mt-1 size-4 accent-brand-600" />
        <span>
          Acepto los <Link href="/legal/terminos" className="underline">términos y condiciones</Link> y la <Link href="/legal/privacidad" className="underline">política de privacidad</Link>.
        </span>
      </label>
      {state.errors?.acceptTerms && <p className="text-sm text-brand-600">{state.errors.acceptTerms[0]}</p>}
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Button type="submit" loading={pending} className="w-full" size="lg">Crear cuenta</Button>
      <p className="text-center text-sm text-ink-600">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-600 underline">Inicia sesión</Link>
      </p>
    </form>
  );
}
