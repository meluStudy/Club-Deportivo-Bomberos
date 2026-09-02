"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-[0_8px_24px_-8px_rgba(225,6,0,0.6)] focus-visible:ring-brand-400",
  dark: "bg-ink-950 text-white hover:bg-ink-800 focus-visible:ring-ink-400",
  outline:
    "border-2 border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-white focus-visible:ring-ink-400",
  "outline-light":
    "border-2 border-white text-white hover:bg-white hover:text-ink-950 focus-visible:ring-white",
  ghost: "text-ink-800 hover:bg-ink-100 focus-visible:ring-ink-300",
  danger: "bg-red-50 text-brand-700 hover:bg-red-100 focus-visible:ring-brand-300",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-13 px-8 text-lg",
} as const;

type BaseProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = BaseProps & Omit<HTMLMotionProps<"button">, "children">;
type LinkProps = BaseProps & { href: string; target?: string; rel?: string };

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const tap = { whileTap: { scale: 0.96 }, whileHover: { scale: 1.02 }, transition: { type: "spring", stiffness: 500, damping: 30 } } as const;

export function Button({ variant = "primary", size = "md", loading, className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      {...tap}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </motion.button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className, children, href, ...rest }: LinkProps) {
  return (
    <motion.span {...tap} className="inline-flex">
      <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
        {children}
      </Link>
    </motion.span>
  );
}
