"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({ className, children, hover = true }: { className?: string; children: React.ReactNode; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -6 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("group relative overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card", className)}
    >
      {children}
    </motion.div>
  );
}
