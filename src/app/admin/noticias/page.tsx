import { prisma } from "@/lib/prisma";
import { isAdmin, requireStaff } from "@/lib/auth";
import { AdminHeader, Details, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { deletePostAction, upsertPostAction } from "@/actions/admin";
import { Field, inputClass, textareaClass } from "@/components/ui/form";

export default async function AdminPosts() {
  const staff = await requireStaff();
  const admin = isAdmin(staff);
  const [posts, sections] = await Promise.all([
    prisma.post.findMany({ where: admin ? {} : { sectionId: staff.managedSectionId }, orderBy: { createdAt: "desc" }, include: { section: true } }),
    prisma.section.findMany({ where: admin ? {} : { id: staff.managedSectionId! }, orderBy: { order: "asc" } }),
  ]);
  return (
    <>
      <AdminHeader title="Noticias" description={admin ? "Publica y edita la actualidad del club." : `Noticias de la sección de ${staff.managedSection?.name}.`} />
      <Details summary="➕ Nueva noticia"><PostForm sections={sections} admin={admin} /></Details>
      <div className="mt-8 space-y-4">
        {posts.map((p) => (
          <section key={p.id} className="rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">{p.title} {p.featured && <Badge tone="soft">Destacada</Badge>} {!p.publishedAt && <Badge tone="neutral">Borrador</Badge>}</h2>
                <p className="text-sm text-ink-500">{p.section?.name ?? "Club"} · {p.publishedAt ? `Publicada el ${formatDate(p.publishedAt)}` : "Sin publicar"}</p>
              </div>
              <form action={deletePostAction}><input type="hidden" name="id" value={p.id} /><button className="text-xs text-ink-500 underline hover:text-brand-600">Eliminar</button></form>
            </div>
            <Details summary="Editar"><PostForm sections={sections} post={p} admin={admin} /></Details>
          </section>
        ))}
      </div>
    </>
  );
}

function PostForm({ sections, post, admin }: { sections: { id: string; name: string }[]; admin: boolean; post?: { id: string; title: string; slug: string; excerpt: string; content: string; coverImage: string | null; sectionId: string | null; featured: boolean; publishedAt: Date | null } }) {
  return (
    <form action={upsertPostAction} className="grid gap-4 sm:grid-cols-2">
      {post && <input type="hidden" name="id" value={post.id} />}
      <Field label="Título" name="title"><input id="title" name="title" defaultValue={post?.title} required className={inputClass} /></Field>
      <Field label="Slug (URL)" name="slug"><input id="slug" name="slug" defaultValue={post?.slug} className={inputClass} /></Field>
      <Field label="Sección" name="sectionId">
        <select id="sectionId" name="sectionId" defaultValue={post?.sectionId ?? sections[0]?.id ?? ""} className={inputClass}>
          {admin && <option value="">Club (general)</option>}
          {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Imagen de portada (ruta o URL)" name="image"><input id="image" name="image" defaultValue={post?.coverImage ?? ""} className={inputClass} /></Field>
      <Field label="Entradilla" name="excerpt" className="sm:col-span-2"><input id="excerpt" name="excerpt" defaultValue={post?.excerpt} required className={inputClass} /></Field>
      <Field label="Contenido (markdown sencillo: ## títulos, **negrita**, listas con -)" name="content" className="sm:col-span-2"><textarea id="content" name="content" defaultValue={post?.content} required className={`${textareaClass} min-h-64`} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={post?.featured} className="size-4 accent-brand-600" /> Destacar en portada</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={post ? Boolean(post.publishedAt) : true} className="size-4 accent-brand-600" /> Publicada</label>
      <div className="sm:col-span-2"><button className={smallBtn}>{post ? "Guardar cambios" : "Publicar noticia"}</button></div>
    </form>
  );
}
