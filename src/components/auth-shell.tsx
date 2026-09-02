import { Logo } from "@/components/layout/logo";
import { Reveal } from "@/components/ui/reveal";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 text-white lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.svg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" aria-hidden />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">Club Deportivo Bomberos de Madrid</p>
          <h2 className="mt-3 text-6xl font-extrabold uppercase leading-[0.9]">Tu cuenta<br />del club</h2>
          <p className="mt-4 max-w-md text-ink-300">Gestiona tu cuota de socio, inscríbete en eventos, compra en la tienda oficial y sigue la actualidad del club.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-16 sm:px-8">
        <Reveal className="w-full max-w-md">
          <Logo className="mb-8" />
          <h1 className="text-4xl font-extrabold uppercase">{title}</h1>
          <p className="mb-8 mt-2 text-ink-600">{subtitle}</p>
          {children}
        </Reveal>
      </div>
    </div>
  );
}
