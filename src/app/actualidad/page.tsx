import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { PostCard } from "@/components/cards";
import { getPosts, getSections } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Actualidad", description: "Noticias, resultados y convocatorias del Club Deportivo Bomberos Madrid." };
export const dynamic = "force-dynamic";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ seccion?: string }> }) {
  const { seccion } = await searchParams;
  const [posts, sections] = await Promise.all([getPosts({ sectionSlug: seccion }), getSections()]);

  return (
    <>
      <PageHero eyebrow="Actualidad" title="Noticias del club" description="Resultados, crónicas, convocatorias y todo lo que pasa en el Club Deportivo Bomberos Madrid." />
      <Container className="py-12">
        <nav className="mb-10 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar por sección">
          <FilterChip href="/actualidad" active={!seccion}>Todas</FilterChip>
          {sections.map((s) => (
            <FilterChip key={s.slug} href={`/actualidad?seccion=${s.slug}`} active={seccion === s.slug}>{s.name}</FilterChip>
          ))}
        </nav>
        {posts.length === 0 ? (
          <p className="py-20 text-center text-ink-500">Todavía no hay noticias en esta categoría.</p>
        ) : (
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <StaggerItem key={p.id}>
                <PostCard post={p} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Container>
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("shrink-0 rounded-full border px-4 py-2 font-display text-sm font-bold uppercase tracking-wide transition", active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 text-ink-700 hover:border-ink-950")}>
      {children}
    </Link>
  );
}
