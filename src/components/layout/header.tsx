"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, User, X, LogIn, LayoutDashboard } from "lucide-react";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useCart } from "@/components/cart/cart-context";
import type { SessionUser } from "@/lib/auth";

export function Header({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen: openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el menú móvil al navegar (patrón "estado derivado del render anterior").
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <div className="bg-ink-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs sm:px-6 lg:px-8">
          <p className="hidden font-display uppercase tracking-widest text-ink-300 sm:block">Club Agrupación Deportiva Atlética Bomberos de Madrid · Desde 1985</p>
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
            <Link href="/socios" className="font-semibold text-brand-400 hover:text-white">
              Hazte socio →
            </Link>
            {user ? (
              <Link href={user.role === "ADMIN" ? "/admin" : "/cuenta"} className="flex items-center gap-1.5 hover:text-brand-400">
                {user.role === "ADMIN" ? <LayoutDashboard className="size-3.5" /> : <User className="size-3.5" />}
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 hover:text-brand-400">
                <LogIn className="size-3.5" /> Acceder
              </Link>
            )}
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled ? "border-ink-100 bg-white/90 shadow-sm backdrop-blur-md" : "border-transparent bg-white",
        )}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Logo priority />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 font-display text-[15px] font-semibold uppercase tracking-wide transition-colors hover:text-brand-600",
                  isActive(item.href) ? "text-brand-600" : "text-ink-800",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span layoutId="nav-underline" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-600" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openCart(true)}
              className="relative rounded-full p-2.5 text-ink-800 transition hover:bg-ink-100 hover:text-brand-600"
              aria-label={`Carrito, ${count} artículos`}
            >
              <ShoppingBag className="size-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <Link
              href={user ? (user.role === "ADMIN" ? "/admin" : "/cuenta") : "/login"}
              className="hidden rounded-full p-2.5 text-ink-800 transition hover:bg-ink-100 hover:text-brand-600 sm:block"
              aria-label="Mi cuenta"
            >
              <User className="size-5" />
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full p-2.5 text-ink-800 transition hover:bg-ink-100 lg:hidden"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-ink-950 pt-28 text-white lg:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-stripes" aria-hidden />
            <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-6" aria-label="Menú móvil">
              {mainNav.map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block border-b border-white/10 py-4 font-display text-3xl font-extrabold uppercase",
                      isActive(item.href) ? "text-brand-500" : "text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-6 flex flex-col gap-3 pb-10">
                <Link href={user ? (user.role === "ADMIN" ? "/admin" : "/cuenta") : "/login"} className="rounded-full bg-brand-600 px-6 py-3 text-center font-display font-bold uppercase">
                  {user ? "Mi cuenta" : "Acceder / Registrarse"}
                </Link>
                <Link href="/socios" className="rounded-full border-2 border-white px-6 py-3 text-center font-display font-bold uppercase">
                  Hazte socio
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
