import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/social-icons";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact-form";
import { fullAddress, site } from "@/lib/site";

export const metadata: Metadata = { title: "Contacto", description: "Contacta con el Club Deportivo Bomberos Madrid: dirección, correo, teléfono y redes sociales." };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contacto" title="Hablemos" description="¿Quieres unirte, colaborar, patrocinar o simplemente saber más? Escríbenos y te responderemos lo antes posible." />
      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <Reveal className="min-w-0 lg:col-span-7">
          <h2 className="mb-6 text-3xl font-extrabold uppercase">Envíanos un mensaje</h2>
          <ContactForm />
        </Reveal>
        <aside className="min-w-0 space-y-6 lg:col-span-5">
          <Reveal className="rounded-2xl bg-ink-950 p-6 text-white" delay={0.1}>
            <h2 className="mb-5 text-2xl font-bold uppercase">Datos de contacto</h2>
            <ul className="space-y-4 text-ink-200">
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-brand-500" /><span>{fullAddress}</span></li>
              <li className="flex items-center gap-3"><Mail className="size-5 shrink-0 text-brand-500" /><a href={`mailto:${site.email}`} className="break-all hover:text-white">{site.email}</a></li>
              <li className="flex items-start gap-3"><Clock className="mt-0.5 size-5 shrink-0 text-brand-500" /><span>Secretaría: lunes a viernes, 17:00 - 20:00</span></li>
            </ul>
          </Reveal>
          <Reveal className="rounded-2xl border border-ink-100 p-6" delay={0.2}>
            <h2 className="mb-4 text-2xl font-bold uppercase">Síguenos</h2>
            <ul className="grid gap-2">
              {[
                { href: site.social.instagram, label: "Instagram", handle: site.socialHandles.instagram, Icon: InstagramIcon },
                { href: site.social.facebook, label: "Facebook", handle: site.socialHandles.facebook, Icon: FacebookIcon },
              ].map(({ href, label, handle, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-ink-50">
                    <span className="flex size-10 items-center justify-center rounded-full bg-brand-600 text-white"><Icon className="size-5" /></span>
                    <span><span className="block font-semibold">{label}</span><span className="text-sm text-ink-500">{handle}</span></span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.3} className="overflow-hidden rounded-2xl border border-ink-100">
            <iframe
              title="Mapa de la sede del club en el Parque de Bomberos nº 8"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${site.address.lng - 0.006}%2C${site.address.lat - 0.004}%2C${site.address.lng + 0.006}%2C${site.address.lat + 0.004}&layer=mapnik&marker=${site.address.lat}%2C${site.address.lng}`}
              className="h-64 w-full"
              loading="lazy"
            />
          </Reveal>
        </aside>
      </Container>
    </>
  );
}
