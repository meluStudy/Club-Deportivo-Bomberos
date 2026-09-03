"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Mail, MessageSquare, Newspaper, Package, ShoppingBag, Users, UserCog, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, React.ComponentType<LucideProps>> = { BarChart3, Users, ShoppingBag, Package, CalendarDays, Newspaper, MessageSquare, Mail, UserCog };

export function AdminNav({ links, subtitle }: { links: { href: string; label: string; icon: string }[]; subtitle?: string }) {
  const pathname = usePathname();
  return (
    <aside className="border-b border-ink-200 bg-white lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="px-4 py-4 lg:px-6 lg:py-6">
        <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-600">Administración</p>
        <p className="text-sm text-ink-500">{subtitle ?? "CD Bomberos de Madrid"}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:px-3" aria-label="Administración">
        {links.map((l) => {
          const Icon = icons[l.icon] ?? BarChart3;
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={cn("flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition", active ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100")}>
              <Icon className="size-4" /> {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
