import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light,
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <Reveal className={cn("mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", align === "center" && "text-center sm:flex-col sm:items-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            <span className="h-0.5 w-6 bg-brand-600" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2 className={cn("text-4xl font-extrabold uppercase leading-none sm:text-5xl", light ? "text-white" : "text-ink-950")}>{title}</h2>
        {description && <p className={cn("mt-3 text-lg", light ? "text-ink-300" : "text-ink-600")}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
