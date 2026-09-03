"use client";

import { useRef, useState } from "react";
import { ImageUp, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputClass } from "@/components/ui/form";

/**
 * Campo de imagen para el panel: se puede arrastrar un archivo, elegirlo del
 * disco o pegar una dirección. Guarda la ruta resultante en un campo oculto
 * que viaja con el formulario.
 */
export function ImageField({
  name,
  label,
  defaultValue,
  hint,
  aspect = "aspect-video",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  aspect?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function subir(file: File) {
    setError(null);
    setSubiendo(true);
    try {
      const datos = new FormData();
      datos.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: datos });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se ha podido subir la imagen.");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink-800">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void subir(f);
        }}
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition",
          arrastrando ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-ink-50",
        )}
      >
        {url ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className={cn("w-full object-cover", aspect)} />
            <button
              type="button"
              onClick={() => setUrl("")}
              className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-ink-950/85 px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-brand-600"
            >
              <Trash2 className="size-3.5" /> Quitar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn("flex w-full flex-col items-center justify-center gap-2 p-8 text-center text-ink-500 hover:text-brand-600", aspect)}
          >
            {subiendo ? <Loader2 className="size-7 animate-spin" /> : <ImageUp className="size-7" />}
            <span className="text-sm font-semibold">{subiendo ? "Subiendo…" : "Arrastra una imagen o haz clic para elegirla"}</span>
            <span className="text-xs">JPG, PNG o WebP · hasta 12 MB · se optimiza automáticamente</span>
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void subir(f);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={subiendo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-700 hover:border-brand-600 hover:text-brand-600 disabled:opacity-50"
        >
          <Upload className="size-3.5" /> {url ? "Cambiar imagen" : "Subir imagen"}
        </button>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…o pega aquí la dirección de una imagen"
          className={cn(inputClass, "h-9 flex-1 min-w-48 text-sm")}
          aria-label={`${label}: dirección de la imagen`}
        />
      </div>

      {error ? <p className="text-sm text-brand-600">{error}</p> : hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
