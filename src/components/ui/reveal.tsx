"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/** Curva de salida suave, la misma en toda la web. */
export const SUAVE = [0.22, 1, 0.36, 1] as const;

const variantes: Record<string, Variants> = {
  abajo: { oculto: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } },
  izquierda: { oculto: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0 } },
  derecha: { oculto: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0 } },
  escala: { oculto: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } },
};

type Direccion = keyof typeof variantes;

/** Aparece al entrar en pantalla. Se queda quieto si el sistema pide menos movimiento. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  desde = "abajo",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
  desde?: Direccion;
}) {
  const quieto = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={cn(className)}
      variants={quieto ? { oculto: { opacity: 0 }, visible: { opacity: 1 } } : variantes[desde]}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: quieto ? 0.2 : 0.6, ease: SUAVE, delay: quieto ? 0 : delay }}
    >
      {children}
    </Comp>
  );
}

/** Contenedor cuyos hijos aparecen escalonados, uno detrás de otro. */
export function Stagger({ children, className, gap = 0.07 }: { children: React.ReactNode; className?: string; gap?: number }) {
  const quieto = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ visible: { transition: { staggerChildren: quieto ? 0 : gap, delayChildren: 0.05 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, desde = "abajo" }: { children: React.ReactNode; className?: string; desde?: Direccion }) {
  const quieto = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={quieto ? { oculto: { opacity: 0 }, visible: { opacity: 1 } } : variantes[desde]}
      transition={{ duration: quieto ? 0.2 : 0.55, ease: SUAVE }}
    >
      {children}
    </motion.div>
  );
}

/** Línea roja que se dibuja de izquierda a derecha al entrar en pantalla. */
export function LineaAnimada({ className }: { className?: string }) {
  const quieto = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={cn("block h-0.5 w-6 origin-left bg-brand-600", className)}
      initial={quieto ? undefined : { scaleX: 0 }}
      whileInView={quieto ? undefined : { scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: SUAVE, delay: 0.1 }}
    />
  );
}
