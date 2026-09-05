"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SUAVE } from "@/components/ui/reveal";

const cifras = [
  { valor: 10, etiqueta: "Secciones deportivas" },
  { valor: 850, prefijo: "+", etiqueta: "Socios y socias" },
  { valor: 1985, etiqueta: "Año de fundación", sinAnimar: true },
  { valor: 40, prefijo: "+", etiqueta: "Eventos al año" },
];

/**
 * Cifra que cuenta desde cero al entrar en pantalla.
 * Si el navegador no dispara el observador o el sistema pide menos movimiento,
 * se muestra el número final directamente: nunca se queda en cero.
 */
function Contador({ valor, prefijo = "", sinAnimar }: { valor: number; prefijo?: string; sinAnimar?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enPantalla = useInView(ref, { once: true, amount: 0.3 });
  const quieto = useReducedMotion();
  const anima = !sinAnimar && !quieto;
  const [actual, setActual] = useState(anima ? 0 : valor);

  useEffect(() => {
    if (!anima || !enPantalla) return;
    const DURACION = 1300;
    const inicio = performance.now();
    let frame = 0;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / DURACION);
      // Frenada suave al final
      setActual(Math.round(valor * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [anima, enPantalla, valor]);

  // Red de seguridad: si a los tres segundos sigue a cero, se enseña el número
  useEffect(() => {
    if (!anima) return;
    const t = setTimeout(() => setActual((v) => (v === 0 ? valor : v)), 3000);
    return () => clearTimeout(t);
  }, [anima, valor]);

  return (
    <span ref={ref}>
      {prefijo}
      {actual}
    </span>
  );
}

export function Hero() {
  const seccion = useRef<HTMLElement>(null);
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: seccion, offset: ["start start", "end start"] });
  // La imagen se mueve más despacio que el texto: da sensación de profundidad
  const yFondo = useTransform(scrollYProgress, [0, 1], ["0%", quieto ? "0%" : "18%"]);
  const yTexto = useTransform(scrollYProgress, [0, 1], ["0%", quieto ? "0%" : "-12%"]);
  const opacidad = useTransform(scrollYProgress, [0, 0.75], [1, quieto ? 1 : 0.15]);

  return (
    <section ref={seccion} className="relative flex min-h-[88vh] items-end overflow-hidden bg-ink-950 text-white">
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: yFondo }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: quieto ? 0.3 : 1.6, ease: SUAVE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.svg" alt="" className="h-full w-full scale-110 object-cover opacity-50" />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" aria-hidden />
      <div className="absolute inset-0 bg-stripes" aria-hidden />
      <motion.div
        className="absolute -left-40 top-20 size-[36rem] rounded-full bg-brand-600/30 blur-3xl"
        animate={quieto ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <Container className="relative pb-20 pt-40">
        <motion.div style={{ y: yTexto, opacity: opacidad }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: SUAVE }}
            className="mb-4 inline-flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-[0.3em] text-brand-400"
          >
            <motion.span
              className="h-0.5 w-10 origin-left bg-brand-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.45, duration: 0.6, ease: SUAVE }}
              aria-hidden
            />
            Club Agrupación Deportiva Atlética
          </motion.p>

          <h1 className="max-w-5xl text-6xl font-extrabold uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
            {["Club", "Deportivo", "Bomberos de Madrid"].map((palabra, i) => (
              <span key={palabra} className="block overflow-hidden pb-1">
                <motion.span
                  className={i === 2 ? "block text-gradient" : "block"}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.11, duration: quieto ? 0.3 : 0.8, ease: SUAVE }}
                >
                  {palabra}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.78, duration: 0.6, ease: SUAVE }}
            className="mt-6 max-w-xl text-lg text-ink-200 sm:text-xl"
          >
            Diez secciones deportivas abiertas a los bomberos del Ayuntamiento de Madrid, a sus familias y a quien quiera entrenar con nosotros.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: SUAVE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <ButtonLink href="/socios" size="lg">
              Hazte socio <ArrowRight className="size-5" />
            </ButtonLink>
            <ButtonLink href="/secciones" size="lg" variant="outline-light">
              Descubre las secciones
            </ButtonLink>
          </motion.div>

          <motion.dl
            initial="oculto"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 1.05 } } }}
            className="mt-16 grid grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-4"
          >
            {cifras.map((c) => (
              <motion.div key={c.etiqueta} variants={{ oculto: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: SUAVE }}>
                <dt className="order-2 text-sm text-ink-400">{c.etiqueta}</dt>
                <dd className="font-display text-4xl font-extrabold text-white sm:text-5xl">
                  <Contador valor={c.valor} prefijo={c.prefijo} sinAnimar={c.sinAnimar} />
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>
      </Container>

      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-ink-400 md:block"
        style={{ opacity: opacidad }}
        aria-hidden
      >
        <motion.span className="block" animate={quieto ? undefined : { y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ChevronDown className="size-6" />
        </motion.span>
      </motion.div>
    </section>
  );
}
