"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function EventTabs({ base, tabs }: { base: string; tabs: { key: string; label: string; path: string }[] }) {
  const pathname = usePathname();
  return (
    <div className="sticky top-18 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8" aria-label="Secciones del evento">
        {tabs.map((t) => {
          const href = t.path ? `${base}/${t.path}` : base;
          const active = pathname === href || (t.path === "" && pathname === base);
          return (
            <Link key={t.key} href={href} className={cn("relative shrink-0 px-4 py-4 font-display text-[15px] font-bold uppercase tracking-wide transition-colors hover:text-brand-600", active ? "text-brand-600" : "text-ink-700")}>
              {t.label}
              {active && <motion.span layoutId="event-tab" className="absolute inset-x-3 bottom-0 h-0.5 bg-brand-600" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
