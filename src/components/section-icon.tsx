import { dibujar, pictogramas } from "@/lib/pictogramas";

/**
 * Icono de una sección deportiva. Usa los mismos pictogramas que las
 * ilustraciones de la web, para que todo mantenga el mismo trazo.
 */
export function SectionIcon({ slug, className }: { slug: string; className?: string }) {
  const trazos = pictogramas[slug] ?? pictogramas.club;
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: dibujar(trazos, { color: "currentColor", scale: 1 }) }}
    />
  );
}
