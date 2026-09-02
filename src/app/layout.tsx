import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";

const sans = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.shortName}` },
  description: site.description,
  openGraph: { type: "website", locale: "es_ES", siteName: site.name, title: site.name, description: site.description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#e10600", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, sections] = await Promise.all([
    getSession(),
    prisma.section.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <html lang="es" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header user={session} />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer sections={sections} />
          <CartDrawer />
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
