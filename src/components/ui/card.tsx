"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Tarjeta con respuesta al pasar el ratón y al pulsar. En el móvil no hay
 * ratón, así que el gesto de pulsar es el que da la sensación de que responde.
 */
export function Card({ className, children, hover = true }: { className?: string; children: React.ReactNode; hover?: boolean }) {
  const quieto = useReducedMotion();
  return (
    <motion.div
      whileHover={hover && !quieto ? { y: -6 } : undefined}
      whileTap={hover && !quieto ? { scale: 0.985 } : undefined}
      transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.6 }}
      className={cn("group relative overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card", className)}
    >
      {children}
    </motion.div>
  );
}
