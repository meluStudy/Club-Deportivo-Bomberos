import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-600 text-white",
  soft: "bg-brand-50 text-brand-700",
  dark: "bg-ink-950 text-white",
  neutral: "bg-ink-100 text-ink-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  outline: "border border-white/40 text-white",
} as const;

export function Badge({ tone = "brand", className, children }: { tone?: keyof typeof tones; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wider", tones[tone], className)}>
      {children}
    </span>
  );
}
