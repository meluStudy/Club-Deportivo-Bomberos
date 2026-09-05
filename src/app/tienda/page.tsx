import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { ProductCard } from "@/components/cards";
import { getActiveMembership, getProducts } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tienda oficial", description: "Equipación oficial, ropa y accesorios del Club Deportivo Bomberos de Madrid. Descuento para socios." };
export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const session = await getSession();
  const [all, membership] = await Promise.all([getProducts(), session ? getActiveMembership(session.id) : null]);
  const categories = Array.from(new Set(all.map((p) => p.category)));
  const products = categoria ? all.filter((p) => p.category === categoria) : all;

  return (
    <>
      <PageHero eyebrow="Tienda oficial" title="Viste los colores del club" description="Equipación oficial, ropa y accesorios. Recogida gratuita en el Parque Central o envío a domicilio.">
        {!membership && <p className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">Los socios tienen un 15% de descuento en toda la tienda.</p>}
        {membership && <p className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Precios de socio aplicados ✓</p>}
      </PageHero>
      <Container className="py-12">
        <nav className="mb-10 flex gap-2 overflow-x-auto pb-2" aria-label="Categorías">
          <Chip href="/tienda" active={!categoria}>Todo</Chip>
          {categories.map((c) => (
            <Chip key={c} href={`/tienda?categoria=${encodeURIComponent(c)}`} active={categoria === c}>{c}</Chip>
          ))}
        </nav>
        <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} isMember={Boolean(membership)} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("shrink-0 rounded-full border px-4 py-2 font-display text-sm font-bold uppercase tracking-wide transition", active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 text-ink-700 hover:border-ink-950")}>
      {children}
    </Link>
  );
}
