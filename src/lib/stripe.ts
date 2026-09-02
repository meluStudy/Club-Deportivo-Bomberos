import "server-only";
import Stripe from "stripe";

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;

export function getStripe() {
  if (!stripeEnabled) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-08-27.basil" as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return client;
}
