import { cn } from "@/lib/utils";

export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl font-extrabold uppercase">{title}</h1>
        {description && <p className="text-ink-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-5 shadow-card", accent ? "bg-brand-600 text-white" : "bg-white")}>
      <p className={cn("text-xs font-bold uppercase tracking-wider", accent ? "text-white/80" : "text-ink-500")}>{label}</p>
      <p className="mt-1 font-display text-4xl font-extrabold">{value}</p>
      {sub && <p className={cn("text-xs", accent ? "text-white/80" : "text-ink-500")}>{sub}</p>}
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl bg-white shadow-card", className)}>
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export const th = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500 border-b border-ink-100";
export const td = "px-4 py-3 border-b border-ink-50 align-middle";
export const smallInput = "h-9 rounded-lg border border-ink-200 px-2 text-sm focus:border-brand-600 focus:outline-none";
export const smallBtn = "h-9 rounded-lg bg-ink-950 px-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-600 transition";

export function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl bg-white p-6 shadow-card", className)}>
      <h2 className="mb-4 text-2xl font-bold uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function Details({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl bg-white shadow-card">
      <summary className="cursor-pointer list-none px-6 py-4 font-display text-lg font-bold uppercase transition hover:text-brand-600">
        <span className="mr-2 inline-block transition group-open:rotate-90">▸</span>
        {summary}
      </summary>
      <div className="border-t border-ink-100 px-6 py-5">{children}</div>
    </details>
  );
}
