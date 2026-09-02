import { cn } from "@/lib/utils";

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string[] | string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const msg = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={name} className="text-sm font-semibold text-ink-800">
        {label}
      </label>
      {children}
      {msg ? (
        <p className="text-sm text-brand-600" role="alert">
          {msg}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-ink-900 placeholder:text-ink-400 transition focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50";

export const textareaClass = inputClass.replace("h-11", "min-h-32 py-3");

export function Alert({ tone = "info", children }: { tone?: "info" | "success" | "error"; children: React.ReactNode }) {
  const tones = {
    info: "border-ink-200 bg-ink-50 text-ink-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-brand-200 bg-brand-50 text-brand-800",
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
