"use client";

import { MotionConfig } from "framer-motion";

/**
 * Ajustes de animación comunes a toda la web. Con `reducedMotion="user"` se
 * respeta la preferencia de quien tenga activado "reducir movimiento" en su
 * móvil o su ordenador: las animaciones se desactivan solas.
 */
export function Motion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
