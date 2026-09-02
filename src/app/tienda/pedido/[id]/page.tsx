import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ClearCart } from "@/components/shop/clear-cart";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const paid = order.status !== "PENDING" && order.status !== "CANCELLED";
  const address = order.address ? (JSON.parse(order.address) as { address: string; city: string; postalCode: string }) : null;

  return (
    <Container className="max-w-3xl py-16">
      {paid && <ClearCart />}
      <Reveal className="rounded-3xl border border-ink-100 p-8 shadow-card">
        <div className="flex items-center gap-3">
          {paid ? <CheckCircle2 className="size-10 text-emerald-600" /> : <Clock className="size-10 text-amber-500" />}
          <div>
            <h1 className="text-4xl font-extrabold uppercase">{paid ? "¡Pedido confirmado!" : "Pedido pendiente de pago"}</h1>
            <p className="text-ink-600">Referencia <span className="font-mono">{order.id.slice(-8).toUpperCase()}</span></p>
          </div>
        </div>
        <p className="mt-6 text-ink-700">
          {paid
            ? `Gracias, ${order.fullName}. Te hemos enviado la confirmación a ${order.email}. ${order.shippingMethod === "recogida" ? "Podrás recoger tu pedido en el Parque Central de Bomberos en horario de secretaría." : "Prepararemos tu envío en 24-48 horas."}`
            : "El pago no se ha completado todavía. Si has cancelado, puedes volver a la tienda para intentarlo de nuevo."}
        </p>

        <ul className="mt-8 divide-y divide-ink-100 border-y border-ink-100">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between py-3">
              <span>
                <span className="font-semibold">{i.productName}</span> <span className="text-ink-500">· {i.variantLabel} × {i.quantity}</span>
              </span>
              <span className="font-display text-lg font-bold">{formatPrice(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
          {order.shippingMethod === "envio" && (
            <li className="flex items-center justify-between py-3 text-ink-600">
              <span>Envío{address ? ` · ${address.address}, ${address.postalCode} ${address.city}` : ""}</span>
              <span>{formatPrice(495)}</span>
            </li>
          )}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-ink-600">Total</span>
          <span className="font-display text-3xl font-extrabold">{formatPrice(order.totalCents)}</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/tienda" variant="outline">Seguir comprando</ButtonLink>
          {order.userId && <ButtonLink href="/cuenta">Ver mis pedidos</ButtonLink>}
        </div>
        <p className="mt-6 text-xs text-ink-500">
          Consulta nuestra <Link href="/legal/devoluciones" className="underline">política de envíos y devoluciones</Link>.
        </p>
      </Reveal>
    </Container>
  );
}
