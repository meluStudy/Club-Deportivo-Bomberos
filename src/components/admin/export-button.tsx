import { FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

/** Enlace de descarga de un listado en CSV, listo para abrir en Excel. */
export function ExportButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg bg-ink-950 px-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-600",
        className,
      )}
    >
      <FileSpreadsheet className="size-4" /> {children}
    </a>
  );
}
