"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { contactAction } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Alert, Field, inputClass, textareaClass } from "@/components/ui/form";

export function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, {});
  if (state.ok) return <Alert tone="success">{state.message}</Alert>;

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" name="name" error={state.errors?.name}>
          <input id="name" name="name" required className={inputClass} />
        </Field>
        <Field label="Correo electrónico" name="email" error={state.errors?.email}>
          <input id="email" name="email" type="email" required className={inputClass} />
        </Field>
      </div>
      <Field label="Asunto" name="subject" error={state.errors?.subject}>
        <select id="subject" name="subject" className={inputClass} defaultValue="Información general">
          {["Información general", "Quiero hacerme socio", "Secciones deportivas", "Eventos e inscripciones", "Tienda y pedidos", "Prensa y patrocinio", "Otro"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label="Mensaje" name="message" error={state.errors?.message}>
        <textarea id="message" name="message" required className={textareaClass} />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex items-start gap-3 text-sm text-ink-700">
        <input type="checkbox" name="acceptPrivacy" className="mt-1 size-4 accent-brand-600" />
        <span>
          He leído y acepto la <Link href="/legal/privacidad" className="underline">política de privacidad</Link>.
        </span>
      </label>
      {state.errors?.acceptPrivacy && <p className="text-sm text-brand-600">{state.errors.acceptPrivacy[0]}</p>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Button type="submit" loading={pending} size="lg">
        <Send className="size-4" /> Enviar mensaje
      </Button>
    </form>
  );
}
