import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getCurrentUser } from "@/lib/auth";
import { getActiveMembership } from "@/lib/data";
import { Alert } from "@/components/ui/form";

export const metadata: Metadata = { title: "Finalizar compra" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ cancelado?: string }> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const membership = user ? await getActiveMembership(user.id) : null;
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="mb-8 text-5xl font-extrabold uppercase">Finalizar compra</h1>
      {sp.cancelado && <div className="mb-6"><Alert tone="error">El pago se ha cancelado. Tu carrito sigue disponible.</Alert></div>}
      <CheckoutForm user={user ? { name: user.name, email: user.email, phone: user.phone } : null} isMember={Boolean(membership)} />
    </Container>
  );
}
