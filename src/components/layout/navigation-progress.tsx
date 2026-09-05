"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Barra de progreso al cambiar de página. Aparece en cuanto se pulsa un enlace
 * interno y desaparece cuando la página nueva está en pantalla. Sin ella, en
 * el móvil parece que la web no responde mientras carga.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const reducirMovimiento = useReducedMotion();
  // Cuando la ruta ya ha cambiado, la página nueva está en pantalla: se apaga.
  // Es el patrón de React para ajustar estado cuando cambia una entrada.
  const rutaActual = `${pathname}?${searchParams}`;
  const [rutaAnterior, setRutaAnterior] = useState(rutaActual);
  if (rutaAnterior !== rutaActual) {
    setRutaAnterior(rutaActual);
    setCargando(false);
  }

  // Se activa al pulsar cualquier enlace que lleve a otra página de la web
  useEffect(() => {
    const alPulsar = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const enlace = (e.target as HTMLElement).closest?.("a");
      if (!enlace) return;

      const href = enlace.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (enlace.target === "_blank" || enlace.hasAttribute("download")) return;

      const url = new URL(enlace.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setCargando(true);
    };
    document.addEventListener("click", alPulsar, { capture: true });
    return () => document.removeEventListener("click", alPulsar, { capture: true } as EventListenerOptions);
  }, []);

  // Red de seguridad: si algo falla, no se queda encendida para siempre
  useEffect(() => {
    if (!cargando) return;
    const t = setTimeout(() => setCargando(false), 10000);
    return () => clearTimeout(t);
  }, [cargando]);

  if (reducirMovimiento) return null;

  return (
    <AnimatePresence>
      {cargando && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-brand-600"
          style={{ boxShadow: "0 0 12px 1px rgba(225,6,0,.7)" }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: [0, 0.35, 0.62, 0.82, 0.92], transition: { duration: 2.2, times: [0, 0.15, 0.4, 0.7, 1], ease: "easeOut" } }}
          // Al llegar, la barra se completa y se apaga enseguida
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }}
        />
      )}
    </AnimatePresence>
  );
}
