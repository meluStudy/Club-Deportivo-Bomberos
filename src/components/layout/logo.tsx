import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, light, compact }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)} aria-label="Club Deportivo Bomberos Madrid, inicio">
      <Image src="/images/logo.svg" alt="" width={44} height={44} priority className="size-11" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-lg font-extrabold uppercase tracking-wide", light ? "text-white" : "text-ink-950")}>
            Club Deportivo
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Bomberos Madrid</span>
        </span>
      )}
    </Link>
  );
}
