import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Reveal } from "./reveal";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  image,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  image?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-ink-950 text-white", className)}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      )}
      <div className="absolute inset-0 bg-stripes" aria-hidden />
      <div className="absolute -right-32 -top-32 size-[28rem] rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
      <Container className="relative py-20 sm:py-28">
        <Reveal>
          {eyebrow && (
            <p className="mb-3 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
              <span className="h-0.5 w-6 bg-brand-500" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className="max-w-4xl text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl lg:text-7xl">{title}</h1>
          {description && <p className="mt-5 max-w-2xl text-lg text-ink-300 sm:text-xl">{description}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </Reveal>
      </Container>
    </section>
  );
}
