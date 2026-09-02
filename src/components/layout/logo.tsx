import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * Logotipo oficial del club, vectorizado a partir del original.
 * - `light`: versión para fondos oscuros (texto en blanco).
 * - `compact`: solo el isotipo (corredor y pista), sin la tipografía.
 */
export function Logo({ className, light, compact, priority }: { className?: string; light?: boolean; compact?: boolean; priority?: boolean }) {
  const src = compact
    ? light
      ? "/images/marca/isotipo-inverso.svg"
      : "/images/marca/isotipo.svg"
    : light
      ? "/images/marca/logo-inverso.svg"
      : "/images/marca/logo.svg";

  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label={`${site.name}, ir al inicio`}>
      <Image
        src={src}
        alt={site.name}
        width={compact ? 178 : 296}
        height={compact ? 103 : 167}
        priority={priority}
        className={cn("w-auto", compact ? "h-10" : "h-12 sm:h-14")}
      />
    </Link>
  );
}
