import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatPrice, parseJson } from "@/lib/utils";
import { SectionIcon } from "./section-icon";

type PostCardProps = {
  post: { slug: string; title: string; excerpt: string; coverImage: string | null; publishedAt: Date | null; section?: { name: string; slug: string } | null };
  large?: boolean;
};

export function PostCard({ post, large }: PostCardProps) {
  return (
    <Card className={large ? "flex h-full flex-col" : "flex h-full flex-col"}>
      <Link href={`/actualidad/${post.slug}`} className="flex h-full flex-col">
        <div className={`relative overflow-hidden ${large ? "aspect-[16/10]" : "aspect-[16/10]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage ?? "/images/hero.svg"} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute left-4 top-4 flex gap-2">
            {post.section && <Badge>{post.section.name}</Badge>}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          {post.publishedAt && <time className="text-xs font-semibold uppercase tracking-wider text-ink-500">{formatDate(post.publishedAt)}</time>}
          <h3 className={`mt-2 font-bold leading-tight text-ink-950 transition group-hover:text-brand-600 ${large ? "text-3xl" : "text-2xl"}`}>{post.title}</h3>
          <p className="mt-2 line-clamp-3 text-ink-600">{post.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-1 pt-4 font-display text-sm font-bold uppercase tracking-wider text-brand-600">
            Leer más <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </Card>
  );
}

export function SectionCard({ section }: { section: { slug: string; name: string; tagline: string; icon: string; coverImage: string | null } }) {
  return (
    <Card className="h-full">
      <Link href={`/secciones/${section.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ink-950 sm:aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={section.coverImage ?? "/images/hero.svg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span className="mb-3 inline-flex size-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow">
            <SectionIcon name={section.icon} className="size-5" />
          </span>
          <h3 className="text-3xl font-extrabold uppercase leading-none">{section.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink-200">{section.tagline}</p>
        </div>
      </Link>
    </Card>
  );
}

type EventCardProps = {
  event: {
    slug: string;
    title: string;
    startsAt: Date;
    location: string;
    priceCents: number;
    memberPriceCents: number | null;
    capacity: number | null;
    coverImage: string | null;
    section?: { name: string; slug: string } | null;
    _count?: { registrations: number };
  };
};

export function EventCard({ event }: EventCardProps) {
  const date = new Date(event.startsAt);
  const full = event.capacity != null && (event._count?.registrations ?? 0) >= event.capacity;
  return (
    <Card className="h-full">
      <Link href={`/eventos/${event.slug}`} className="flex h-full flex-col sm:flex-row">
        <div className="relative aspect-[16/9] sm:aspect-auto sm:w-44 sm:shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.coverImage ?? "/images/hero.svg"} alt="" className="h-full w-full object-cover" />
          <div className="absolute left-4 top-4 flex flex-col items-center rounded-xl bg-white px-3 py-2 text-ink-950 shadow-lg">
            <span className="font-display text-3xl font-extrabold leading-none">{date.getDate()}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">{formatDate(date, { month: "short" })}</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            {event.section && <Badge tone="soft">{event.section.name}</Badge>}
            {full ? <Badge tone="neutral">Completo</Badge> : <Badge tone="success">Inscripciones abiertas</Badge>}
          </div>
          <h3 className="mt-3 text-2xl font-bold leading-tight text-ink-950 transition group-hover:text-brand-600">{event.title}</h3>
          <ul className="mt-3 space-y-1 text-sm text-ink-600">
            <li className="flex items-center gap-2"><CalendarDays className="size-4 text-brand-600" /> {formatDate(date, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-brand-600" /> {event.location}</li>
            {event.capacity != null && (
              <li className="flex items-center gap-2"><Users className="size-4 text-brand-600" /> {event._count?.registrations ?? 0} / {event.capacity} plazas</li>
            )}
          </ul>
          <div className="mt-auto flex items-baseline gap-3 pt-4">
            <span className="font-display text-2xl font-extrabold">{event.priceCents === 0 ? "Gratis" : formatPrice(event.priceCents)}</span>
            {event.memberPriceCents != null && event.memberPriceCents !== event.priceCents && (
              <span className="text-sm text-brand-600">Socios: {event.memberPriceCents === 0 ? "gratis" : formatPrice(event.memberPriceCents)}</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function ProductCard({ product, isMember }: { product: { slug: string; name: string; category: string; priceCents: number; memberPriceCents: number | null; images: string; variants: { stock: number }[] }; isMember?: boolean }) {
  const images = parseJson<string[]>(product.images, []);
  const totalStock = product.variants.reduce((n, v) => n + v.stock, 0);
  const price = isMember && product.memberPriceCents != null ? product.memberPriceCents : product.priceCents;
  return (
    <Card className="h-full">
      <Link href={`/tienda/${product.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0] ?? "/images/hero.svg"} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          {totalStock === 0 && <Badge tone="dark" className="absolute left-4 top-4">Agotado</Badge>}
          {totalStock > 0 && totalStock <= 5 && <Badge className="absolute left-4 top-4">Últimas unidades</Badge>}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">{product.category}</span>
          <h3 className="mt-1 text-xl font-bold leading-tight text-ink-950 transition group-hover:text-brand-600">{product.name}</h3>
          <div className="mt-auto flex items-baseline gap-2 pt-3">
            <span className="font-display text-2xl font-extrabold">{formatPrice(price)}</span>
            {isMember && product.memberPriceCents != null && product.memberPriceCents < product.priceCents && (
              <span className="text-sm text-ink-400 line-through">{formatPrice(product.priceCents)}</span>
            )}
            {!isMember && product.memberPriceCents != null && product.memberPriceCents < product.priceCents && (
              <span className="text-xs font-semibold text-brand-600">Socios {formatPrice(product.memberPriceCents)}</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
