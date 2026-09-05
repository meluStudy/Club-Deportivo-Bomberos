import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader, Details, Table, th, td, smallInput, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/admin/export-button";
import { formatPrice, parseJson, sortVariants } from "@/lib/utils";
import { toggleProductAction, updateStockAction, upsertProductAction } from "@/actions/admin";
import { inputClass, textareaClass, Field } from "@/components/ui/form";
import { ImageField } from "@/components/admin/image-field";

export default async function AdminShop() {
  await requireAdmin();
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { variants: { orderBy: { sku: "asc" } } } });

  return (
    <>
      <AdminHeader title="Tienda y stock" description="Inventario por talla y color. Los cambios se reflejan al instante en la tienda." action={<ExportButton href="/api/export/pedidos">Descargar pedidos</ExportButton>} />

      <Details summary="➕ Añadir producto nuevo">
        <ProductForm />
      </Details>

      <div className="mt-8 space-y-6">
        {products.map((p) => {
          const total = p.variants.reduce((n, v) => n + v.stock, 0);
          return (
            <section key={p.id} className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={parseJson<string[]>(p.images, [])[0] ?? "/images/hero.svg"} alt="" className="size-14 rounded-xl object-cover" />
                  <div>
                    <h2 className="text-xl font-bold">{p.name} {!p.active && <Badge tone="neutral">Oculto</Badge>} {p.featured && <Badge tone="soft">Destacado</Badge>}</h2>
                    <p className="text-sm text-ink-500">{p.category} · {formatPrice(p.priceCents)}{p.memberPriceCents != null && ` · socios ${formatPrice(p.memberPriceCents)}`} · stock total {total}</p>
                  </div>
                </div>
                <form action={toggleProductAction}><input type="hidden" name="id" value={p.id} /><button className={smallBtn}>{p.active ? "Ocultar de la tienda" : "Publicar en tienda"}</button></form>
              </div>
              <Table>
                <thead><tr><th className={th}>SKU</th><th className={th}>Color</th><th className={th}>Talla</th><th className={th}>Stock</th><th className={th}>Actualizar</th></tr></thead>
                <tbody>
                  {sortVariants(p.variants).map((v) => (
                    <tr key={v.id}>
                      <td className={td}><code className="text-xs">{v.sku}</code></td>
                      <td className={td}>{v.color ?? "—"}</td>
                      <td className={td}>{v.size ?? "—"}</td>
                      <td className={td}><Badge tone={v.stock === 0 ? "brand" : v.stock <= 5 ? "warning" : "success"}>{v.stock}</Badge></td>
                      <td className={td}>
                        <form action={updateStockAction} className="flex items-center gap-2">
                          <input type="hidden" name="variantId" value={v.id} />
                          <input type="number" name="stock" min={0} defaultValue={v.stock} className={`${smallInput} w-24`} aria-label="Nuevo stock" />
                          <button className={smallBtn}>Guardar</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="mt-4">
                <Details summary="Editar producto y añadir variantes">
                  <ProductForm product={p} />
                </Details>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function ProductForm({ product }: { product?: { id: string; name: string; slug: string; category: string; description: string; priceCents: number; memberPriceCents: number | null; images: string; featured: boolean; active: boolean } }) {
  return (
    <form action={upsertProductAction} className="grid gap-4 sm:grid-cols-2">
      {product && <input type="hidden" name="id" value={product.id} />}
      <Field label="Nombre" name="name"><input id="name" name="name" defaultValue={product?.name} required className={inputClass} /></Field>
      <Field label="Slug (URL)" name="slug" hint="Se genera automáticamente si se deja vacío"><input id="slug" name="slug" defaultValue={product?.slug} className={inputClass} /></Field>
      <Field label="Categoría" name="category"><input id="category" name="category" defaultValue={product?.category ?? "Equipación"} className={inputClass} /></Field>
      <ImageField name="image" label="Imagen del producto" defaultValue={parseJson<string[]>(product?.images ?? "[]", [])[0]} aspect="aspect-square" />
      <Field label="Precio (€)" name="price"><input id="price" name="price" type="number" step="0.01" min={0} defaultValue={product ? product.priceCents / 100 : ""} required className={inputClass} /></Field>
      <Field label="Precio socios (€, opcional)" name="memberPrice"><input id="memberPrice" name="memberPrice" type="number" step="0.01" min={0} defaultValue={product?.memberPriceCents != null ? product.memberPriceCents / 100 : ""} className={inputClass} /></Field>
      <Field label="Descripción" name="description" className="sm:col-span-2"><textarea id="description" name="description" defaultValue={product?.description} className={textareaClass} /></Field>
      <Field label="Variantes (una por línea: Talla | Color | Stock)" name="variants" className="sm:col-span-2" hint="Ejemplo: M | Rojo | 20. Las variantes existentes con el mismo talla/color se actualizan.">
        <textarea id="variants" name="variants" className={textareaClass} placeholder={"S | Rojo | 10\nM | Rojo | 15\nL | Rojo | 15"} />
      </Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} className="size-5 accent-brand-600 sm:size-4" /> Destacar en portada</label>
      <div className="sm:col-span-2"><button className={smallBtn}>{product ? "Guardar cambios" : "Crear producto"}</button></div>
    </form>
  );
}
