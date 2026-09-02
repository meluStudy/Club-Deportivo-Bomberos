import Link from "next/link";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { FacebookIcon, InstagramIcon, TikTokIcon, XIcon, YoutubeIcon } from "@/components/social-icons";
import { fullAddress, legalNav, mainNav, site } from "@/lib/site";
import { Logo } from "./logo";

const socials = [
  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: site.social.twitter, label: "X (Twitter)", Icon: XIcon },
  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: site.social.youtube, label: "YouTube", Icon: YoutubeIcon },
  { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
];

export function Footer({ sections }: { sections: { slug: string; name: string }[] }) {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      <div className="absolute inset-0 bg-stripes" aria-hidden />
      <div className="absolute -left-40 top-0 size-[30rem] rounded-full bg-brand-600/20 blur-3xl" aria-hidden />

      {/* CTA superior */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Únete al club</p>
            <h2 className="mt-1 text-4xl font-extrabold uppercase text-white sm:text-5xl">Somos más que un club. Somos familia.</h2>
          </div>
          <Link
            href="/socios"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 font-display text-lg font-bold uppercase text-white transition hover:bg-brand-700"
          >
            Hazte socio <ArrowUpRight className="size-5" />
          </Link>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Club Agrupación Deportiva Atlética Bomberos de Madrid. Deporte, compañerismo y compromiso con la ciudad desde {site.founded}.
          </p>
          <ul className="mt-6 flex gap-3">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-brand-500 hover:bg-brand-600"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <FooterCol title="El club" className="lg:col-span-2">
          {mainNav.map((i) => (
            <FooterLink key={i.href} href={i.href}>
              {i.label}
            </FooterLink>
          ))}
          <FooterLink href="/cuenta">Mi cuenta</FooterLink>
        </FooterCol>

        <FooterCol title="Secciones" className="lg:col-span-2">
          {sections.map((s) => (
            <FooterLink key={s.slug} href={`/secciones/${s.slug}`}>
              {s.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Legal" className="lg:col-span-2">
          {legalNav.map((i) => (
            <FooterLink key={i.href} href={i.href}>
              {i.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Contacto" className="lg:col-span-2">
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" />
            <span>{fullAddress}</span>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-brand-500" />
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Phone className="size-4 shrink-0 text-brand-500" />
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">
              {site.phone}
            </a>
          </li>
        </FooterCol>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {site.legalName}. CIF {site.cif}. Todos los derechos reservados.
          </p>
          <p className="text-ink-500">Entidad deportiva sin ánimo de lucro inscrita en el Registro de Entidades Deportivas de la Comunidad de Madrid.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-white">{title}</h3>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition hover:text-white hover:underline hover:underline-offset-4">
        {children}
      </Link>
    </li>
  );
}
