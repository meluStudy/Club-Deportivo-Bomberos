import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/ui/reveal";
import { PostCard } from "@/components/cards";
import { getPost, getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: p.coverImage ? [p.coverImage] : [] } } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.publishedAt || post.publishedAt > new Date()) notFound();
  const related = (await getPosts({ take: 4 })).filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article>
      <div className="relative overflow-hidden bg-ink-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.coverImage ?? "/images/hero.svg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-ink-950/30" aria-hidden />
        <Container className="relative py-24 sm:py-32">
          <Reveal>
            <Link href="/actualidad" className="mb-6 -ml-1 inline-flex items-center gap-2 px-1 py-2 text-sm text-ink-300 hover:text-white">
              <ArrowLeft className="size-4" /> Volver a actualidad
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              {post.section && <Badge>{post.section.name}</Badge>}
              <time className="text-sm text-ink-300">{formatDate(post.publishedAt)}</time>
            </div>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold uppercase leading-[0.95] sm:text-6xl">{post.title}</h1>
            <p className="mt-5 max-w-2xl text-xl text-ink-200">{post.excerpt}</p>
          </Reveal>
        </Container>
      </div>

      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <Reveal className="min-w-0 lg:col-span-8">
          <Markdown content={post.content} className="text-lg" />
          <div className="mt-10 flex items-center justify-between border-t border-ink-100 pt-6 text-sm text-ink-500">
            <span>{post.author?.name ? `Publicado por ${post.author.name}` : "Club Deportivo Bomberos de Madrid"}</span>
            <span className="inline-flex items-center gap-2"><Share2 className="size-4" /> Compartir</span>
          </div>
        </Reveal>
        <aside className="min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-2xl font-bold uppercase">Más noticias</h2>
          <div className="grid gap-4">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </aside>
      </Container>
    </article>
  );
}
