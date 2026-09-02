import { notFound, redirect } from "next/navigation";
import { CreditCard, FlaskConical } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/form";
import { prisma } from "@/lib/prisma";
import { stripeEnabled } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { demoPaymentAction } from "@/actions/demo-payment";

export const dynamic = "force-dynamic";

export default async function DemoPaymentPage({ searchParams }: { searchParams: Promise<{ payment?: string; next?: string; cancel?: string }> }) {
  if (stripeEnabled) redirect("/");
  const sp = await searchParams;
  const payment = sp.payment ? await prisma.payment.findUnique({ where: { id: sp.payment } }) : null;
  if (!payment) notFound();
  if (payment.status !== "PENDING") redirect(sp.next ?? "/");

  const labels = { MEMBERSHIP: "Cuota de socio", EVENT: "Inscripción a evento", ORDER: "Pedido de la tienda" };

  return (
    <Container className="max-w-lg py-20">
      <div className="rounded-3xl border border-ink-100 p-8 shadow-card">
        <Alert>
          <FlaskConical className="mr-1 inline size-4" /> <strong>Modo demo.</strong> Stripe no está configurado, así que esta pantalla simula la pasarela de pago. Configura las claves de Stripe en el archivo .env para cobrar de verdad.
        </Alert>
        <h1 className="mt-6 flex items-center gap-2 text-3xl font-extrabold uppercase"><CreditCard className="size-7 text-brand-600" /> Pasarela de pago</h1>
        <p className="mt-2 text-ink-600">{labels[payment.type]}</p>
        <p className="mt-6 font-display text-5xl font-extrabold">{formatPrice(payment.amountCents)}</p>
        <form action={demoPaymentAction} className="mt-8 grid gap-3">
          <input type="hidden" name="payment" value={payment.id} />
          <input type="hidden" name="next" value={sp.next ?? "/"} />
          <input type="hidden" name="cancel" value={sp.cancel ?? "/"} />
          <Button type="submit" name="outcome" value="success" size="lg">Simular pago correcto</Button>
          <Button type="submit" name="outcome" value="fail" variant="outline">Simular pago cancelado</Button>
        </form>
      </div>
    </Container>
  );
}
