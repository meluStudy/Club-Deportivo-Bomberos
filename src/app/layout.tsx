import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { DemoBanner } from "@/components/layout/demo-banner";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { Motion } from "@/components/layout/motion";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { StructuredData } from "@/components/structured-data";

const sans = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · Atletismo, fútbol, rugby y más`, template: `%s · ${site.shortName}` },
  description: site.description,
  applicationName: site.name,
  keywords: ["club deportivo bomberos madrid", "bomberos de madrid deporte", "atletismo bomberos", "marcha ciclista bomberos", site.legalName],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
    images: [{ url: "/images/og.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: ["/images/og.png"] },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: site.shortName, statusBarStyle: "black-translucent" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
  width: "device-width",
  initialScale: 1,
  // Deja al usuario ampliar con los dedos: quitarlo perjudica la accesibilidad
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, sections] = await Promise.all([
    getSession(),
    prisma.section.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <html lang="es" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <StructuredData />
        <Motion>
        <CartProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <DemoBanner />
          <Header user={session} />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer sections={sections} />
          <CartDrawer />
          <CookieBanner />
          <InstallPrompt />
        </CartProvider>
        </Motion>
      </body>
    </html>
  );
}
