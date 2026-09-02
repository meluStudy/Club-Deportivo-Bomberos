import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/ui/reveal";
import { getLegalPage, legalPages } from "@/lib/legal";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  return page ? { title: page.title } : {};
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();
  return (
    <>
      <PageHero eyebrow="Información legal" title={page.title} description={`Última actualización: ${page.updated}`} />
      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <nav className="lg:col-span-3" aria-label="Páginas legales">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1">
            {legalPages.map((p) => (
              <li key={p.slug}>
                <Link href={`/legal/${p.slug}`} className={cn("block shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition lg:whitespace-normal", p.slug === slug ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100")}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Reveal className="lg:col-span-8">
          <Markdown content={page.content} />
        </Reveal>
      </Container>
    </>
  );
}
