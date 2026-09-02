"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const stats = [
  { value: "10", label: "Secciones deportivas" },
  { value: "+850", label: "Socios y socias" },
  { value: "1985", label: "Año de fundación" },
  { value: "+40", label: "Eventos al año" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-ink-950 text-white">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.svg" alt="" className="h-full w-full object-cover opacity-50" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" aria-hidden />
      <div className="absolute inset-0 bg-stripes" aria-hidden />
      <motion.div
        className="absolute -left-40 top-20 size-[36rem] rounded-full bg-brand-600/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <Container className="relative pb-20 pt-40">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-4 inline-flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-[0.3em] text-brand-400"
        >
          <span className="h-0.5 w-10 bg-brand-500" aria-hidden />
          Club Deportivo Bomberos de Madrid
        </motion.p>
        <h1 className="max-w-5xl text-6xl font-extrabold uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
          {["Club", "Deportivo", "Bomberos de Madrid"].map((word, i) => (
            <motion.span
              key={word}
              className={i === 2 ? "block text-gradient" : "block"}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-6 max-w-xl text-lg text-ink-200 sm:text-xl"
        >
          Diez secciones deportivas abiertas a los bomberos del Ayuntamiento de Madrid, a sus familias y a quien quiera entrenar con nosotros.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 grid grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="order-2 text-sm text-ink-400">{s.label}</dt>
              <dd className="font-display text-4xl font-extrabold text-white sm:text-5xl">{s.value}</dd>
            </div>
          ))}
        </motion.dl>
      </Container>

      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-ink-400 md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        aria-hidden
      >
        <ChevronDown className="size-6" />
      </motion.div>
    </section>
  );
}
