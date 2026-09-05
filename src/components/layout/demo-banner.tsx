import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { modoDemo } from "@/lib/demo";

/** Aviso permanente cuando la web está en modo demostración. */
export function DemoBanner() {
  if (!modoDemo()) return null;
  return (
    <div className="bg-amber-400 text-ink-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm font-semibold sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5">
          <FlaskConical className="size-4" /> Web de demostración: los pagos son simulados y los datos, de ejemplo.
        </span>
        <Link href="/demo" className="underline underline-offset-2 hover:text-brand-700">
          Ver cuentas de prueba
        </Link>
      </div>
    </div>
  );
}
