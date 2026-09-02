"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";

const KEY = "cdb-cookie-consent";
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getConsent = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return "unavailable";
  }
};

export function CookieBanner() {
  // En el servidor asumimos "pendiente" (no se muestra) para evitar saltos de hidratación.
  const consent = useSyncExternalStore(subscribe, getConsent, () => "pending");
  const show = consent === null;

  const decide = (value: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    listeners.forEach((l) => l());
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-ink-200 bg-white p-5 shadow-2xl"
          role="dialog"
          aria-label="Aviso de cookies"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Cookie className="size-8 shrink-0 text-brand-600" />
            <p className="flex-1 text-sm text-ink-700">
              Usamos cookies propias y de terceros para el funcionamiento de la web y para analizar su uso. Puedes aceptarlas todas o solo las
              esenciales. Más información en nuestra{" "}
              <Link href="/legal/cookies" className="font-semibold text-brand-600 underline">
                política de cookies
              </Link>
              .
            </p>
            <div className="flex gap-2">
              <button onClick={() => decide("essential")} className="rounded-full border border-ink-300 px-4 py-2 text-sm font-semibold hover:bg-ink-50">
                Solo esenciales
              </button>
              <button onClick={() => decide("all")} className="rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                Aceptar todas
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
