"use client";

import { Field, inputClass, textareaClass } from "@/components/ui/form";
import { CAMPOS_PARTICIPANTE, TALLAS, type CampoParticipante } from "@/lib/validators";

/** Datos del participante que pide la organización del evento. */
export function ParticipantFields({
  campos,
  perfil,
  faltan = [],
}: {
  campos: CampoParticipante[];
  perfil: Partial<Record<CampoParticipante, string>>;
  faltan?: string[];
}) {
  if (campos.length === 0) return null;
  return (
    <fieldset className="space-y-4 rounded-xl border border-ink-200 p-4">
      <legend className="px-1 text-sm font-semibold text-ink-800">Datos del participante</legend>
      {campos.map((campo) => {
        const cfg = CAMPOS_PARTICIPANTE[campo];
        const error = faltan.includes(campo) ? "Este dato es obligatorio" : undefined;
        const opcional = campo === "medicalNotes";
        return (
          <Field key={campo} label={`${cfg.label}${opcional ? " (opcional)" : ""}`} name={campo} error={error}>
            {cfg.tipo === "talla" ? (
              <select id={campo} name={campo} defaultValue={perfil[campo] ?? ""} className={inputClass} required>
                <option value="" disabled>Elige una talla</option>
                {TALLAS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ) : cfg.tipo === "texto-largo" ? (
              <textarea id={campo} name={campo} defaultValue={perfil[campo] ?? ""} className={textareaClass} maxLength={300} />
            ) : (
              <input
                id={campo}
                name={campo}
                type={cfg.tipo === "fecha" ? "date" : cfg.tipo === "telefono" ? "tel" : "text"}
                defaultValue={perfil[campo] ?? ""}
                className={inputClass}
                required={!opcional}
                maxLength={120}
              />
            )}
          </Field>
        );
      })}
      <p className="text-xs text-ink-500">
        Estos datos los pide la organización para el seguro y la gestión de la prueba. Se guardan en tu cuenta para no volver a pedírtelos.
      </p>
    </fieldset>
  );
}
