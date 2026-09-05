import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Truck, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductCard } from "@/components/cards";
import { getActiveMembership, getProduct, getProducts } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { formatPrice, parseJson, sortVariants } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return p ? { title: p.name, description: p.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  const [product, membership] = await Promise.all([getProduct(slug), session ? getActiveMembership(session.id) : null]);
  if (!product || !product.active) notFound();
  const images = parseJson<string[]>(product.images, []);
  const isMember = Boolean(membership);
  const price = isMember && product.memberPriceCents != null ? product.memberPriceCents : product.priceCents;
  const related = (await getProducts({ category: product.category, take: 5 })).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <Container className="py-10 sm:py-16">
      <Link href="/tienda" className="mb-6 -ml-1 inline-flex items-center gap-2 px-1 py-2 text-sm text-ink-500 hover:text-brand-600">
        <ArrowLeft className="size-4" /> Volver a la tienda
      </Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal className="overflow-hidden rounded-3xl bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0] ?? "/images/hero.svg"} alt={product.name} className="aspect-square w-full object-cover" />
        </Reveal>
        <Reveal delay={0.1}>
          <Badge tone="soft">{product.category}</Badge>
          <h1 className="mt-3 text-5xl font-extrabold uppercase leading-none">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl font-extrabold">{formatPrice(price)}</span>
            {isMember && product.memberPriceCents != null && product.memberPriceCents < product.priceCents && (
              <span className="text-lg text-ink-400 line-through">{formatPrice(product.priceCents)}</span>
            )}
          </div>
          {!isMember && product.memberPriceCents != null && product.memberPriceCents < product.priceCents && (
            <p className="mt-1 text-sm text-brand-600">
              Precio para socios: <strong>{formatPrice(product.memberPriceCents)}</strong>. <Link href="/socios" className="underline">Hazte socio</Link>
            </p>
          )}
          <p className="mt-5 text-lg text-ink-700">{product.description}</p>

          <div className="mt-8">
            <AddToCart product={{ id: product.id, slug: product.slug, name: product.name }} variants={sortVariants(product.variants)} unitPriceCents={price} image={images[0]} />
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-ink-600 sm:grid-cols-3">
            <li className="flex items-center gap-2"><Package className="size-4 text-brand-600" /> Recogida gratis en el club</li>
            <li className="flex items-center gap-2"><Truck className="size-4 text-brand-600" /> Envío 4,95 € península</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-600" /> Pago 100% seguro</li>
          </ul>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-3xl font-extrabold uppercase">También te puede interesar</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} isMember={isMember} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
