"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share, SquarePlus, X, Plus } from "lucide-react";
import { site } from "@/lib/site";

const CLAVE = "cdb-instalacion";
const DIAS_DE_ESPERA = 14;

type EventoInstalacion = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Guarda la decisión para no volver a preguntar en un tiempo. */
function recordar(valor: string) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ valor, fecha: Date.now() }));
  } catch {}
}

function yaPreguntado() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (!guardado) return false;
    const { valor, fecha } = JSON.parse(guardado) as { valor: string; fecha: number };
    if (valor === "instalada" || valor === "nunca") return true;
    // Si solo lo cerró, se vuelve a ofrecer pasadas dos semanas
    return Date.now() - fecha < DIAS_DE_ESPERA * 24 * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

/**
 * Invita a añadir la web a la pantalla de inicio del móvil.
 * En Android y escritorio usa el aviso propio del navegador; en iPhone y iPad,
 * donde Safari no lo permite, explica los dos pasos a mano.
 */
export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [esIOS, setEsIOS] = useState(false);
  const [evento, setEvento] = useState<EventoInstalacion | null>(null);

  useEffect(() => {
    // Si ya está instalada, no se ofrece
    const instalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
    if (instalada) {
      recordar("instalada");
      return;
    }
    if (yaPreguntado()) return;

    const ua = window.navigator.userAgent;
    const iosSafari = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && "ontouchend" in document);
    const movil = window.matchMedia("(max-width: 1024px)").matches;

    if (iosSafari && movil) {
      // Se espera un poco para no interrumpir nada más entrar
      const t = setTimeout(() => {
        setEsIOS(true);
        setVisible(true);
      }, 6000);
      return () => clearTimeout(t);
    }

    const alInstalar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalacion);
      setTimeout(() => setVisible(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", alInstalar);
    return () => window.removeEventListener("beforeinstallprompt", alInstalar);
  }, []);

  const cerrar = useCallback((decision: "luego" | "nunca") => {
    recordar(decision === "nunca" ? "nunca" : "luego");
    setVisible(false);
  }, []);

  const instalar = useCallback(async () => {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    recordar(outcome === "accepted" ? "instalada" : "luego");
    setVisible(false);
  }, [evento]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-[55] overflow-hidden rounded-2xl border border-ink-800 bg-ink-950 text-white shadow-2xl lg:left-auto lg:right-6 lg:w-96"
          role="dialog"
          aria-label="Añadir la web a la pantalla de inicio"
        >
          <div className="absolute inset-0 bg-stripes" aria-hidden />
          <div className="relative flex gap-3 p-4">
            <Image src="/icon-192.png" alt="" width={52} height={52} className="size-13 shrink-0 rounded-xl" />
            <div className="flex-1">
              <p className="font-display text-lg font-bold uppercase leading-tight">Ten el club a un toque</p>
              <p className="mt-1 text-sm text-ink-300">
                {esIOS
                  ? "Añade la web a tu pantalla de inicio y se abrirá como una aplicación."
                  : `Instala ${site.shortName} en tu móvil: se abre como una aplicación, sin buscar el enlace.`}
              </p>

              {esIOS ? (
                <ol className="mt-3 space-y-1.5 text-sm text-ink-200">
                  <li className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold">1</span>
                    Pulsa <Share className="size-4 text-brand-400" aria-label="compartir" /> abajo en la barra
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold">2</span>
                    Elige <SquarePlus className="size-4 text-brand-400" aria-hidden /> «Añadir a inicio»
                  </li>
                </ol>
              ) : (
                <button
                  onClick={instalar}
                  className="mt-3 inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-brand-600 px-5 font-display text-sm font-bold uppercase tracking-wide transition hover:bg-brand-700 active:scale-95"
                >
                  <Plus className="size-4" /> Instalar en el móvil
                </button>
              )}

              <button onClick={() => cerrar("nunca")} className="mt-3 block text-xs text-ink-500 underline hover:text-ink-300">
                No volver a mostrar
              </button>
            </div>
            <button
              onClick={() => cerrar("luego")}
              className="-m-1 flex size-9 shrink-0 items-start justify-end text-ink-400 hover:text-white"
              aria-label="Cerrar el aviso"
            >
              <X className="size-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
