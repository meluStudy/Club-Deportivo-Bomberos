import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/social-icons";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contacto", description: "Contacta con el Club Deportivo Bomberos Madrid: dirección, correo, teléfono y redes sociales." };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contacto" title="Hablemos" description="¿Quieres unirte, colaborar, patrocinar o simplemente saber más? Escríbenos y te responderemos lo antes posible." />
      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2 className="mb-6 text-3xl font-extrabold uppercase">Envíanos un mensaje</h2>
          <ContactForm />
        </Reveal>
        <aside className="space-y-6 lg:col-span-5">
          <Reveal className="rounded-2xl bg-ink-950 p-6 text-white" delay={0.1}>
            <h2 className="mb-5 text-2xl font-bold uppercase">Datos de contacto</h2>
            <ul className="space-y-4 text-ink-200">
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-brand-500" /><span>{site.address}</span></li>
              <li className="flex items-center gap-3"><Mail className="size-5 shrink-0 text-brand-500" /><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
              <li className="flex items-center gap-3"><Phone className="size-5 shrink-0 text-brand-500" /><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">{site.phone}</a></li>
              <li className="flex items-start gap-3"><Clock className="mt-0.5 size-5 shrink-0 text-brand-500" /><span>Secretaría: lunes a viernes, 17:00 - 20:00</span></li>
            </ul>
          </Reveal>
          <Reveal className="rounded-2xl border border-ink-100 p-6" delay={0.2}>
            <h2 className="mb-4 text-2xl font-bold uppercase">Síguenos</h2>
            <ul className="grid gap-2">
              {[
                { href: site.social.instagram, label: "Instagram", handle: "@cdbomberosmadrid", Icon: InstagramIcon },
                { href: site.social.facebook, label: "Facebook", handle: "CD Bomberos Madrid", Icon: FacebookIcon },
                { href: site.social.youtube, label: "YouTube", handle: "@cdbomberosmadrid", Icon: YoutubeIcon },
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
              title="Mapa del Parque Central de Bomberos de Madrid"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-3.716%2C40.408%2C-3.704%2C40.416&layer=mapnik&marker=40.412%2C-3.710"
              className="h-64 w-full"
              loading="lazy"
            />
          </Reveal>
        </aside>
      </Container>
    </>
  );
}
