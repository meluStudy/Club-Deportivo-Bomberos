import { fullAddress, site } from "@/lib/site";

/**
 * Datos estructurados (JSON-LD) para buscadores: identifican al club, su logo
 * y su dirección. Google los usa para el favicon y la ficha de la entidad.
 */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "@id": `${site.url}/#organizacion`,
    name: site.name,
    legalName: site.legalName,
    alternateName: site.shortName,
    description: site.description,
    url: site.url,
    logo: { "@type": "ImageObject", url: `${site.url}/icon-512.png`, width: 512, height: 512 },
    image: `${site.url}/images/og.png`,
    email: site.email,
    telephone: site.phone,
    taxID: site.cif,
    foundingDate: String(site.founded),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: "ES",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.address.lat, longitude: site.address.lng },
    sameAs: Object.values(site.social),
    sport: ["Atletismo", "Fútbol", "Rugby", "Ciclismo", "Natación", "Triatlón", "Montañismo", "Pádel", "Baloncesto"],
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#web`,
    url: site.url,
    name: site.name,
    inLanguage: "es-ES",
    publisher: { "@id": `${site.url}/#organizacion` },
  };
  void fullAddress;
  return (
    <script
      type="application/ld+json"
      // El contenido es estático y generado por nosotros.
      dangerouslySetInnerHTML={{ __html: JSON.stringify([data, website]) }}
    />
  );
}
