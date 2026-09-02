import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionCard } from "@/components/cards";
import { getSections } from "@/lib/data";

export const metadata: Metadata = { title: "Secciones deportivas", description: "Todas las secciones deportivas del Club Deportivo Bomberos Madrid: atletismo, fútbol, rugby, ciclismo, natación y más." };
export const dynamic = "force-dynamic";

export default async function SectionsPage() {
  const sections = await getSections();
  return (
    <>
      <PageHero eyebrow="Secciones" title="Un club, diez deportes" description="Cada sección tiene su propio equipo técnico, horarios y calendario de competición. Los socios pueden entrenar en tantas secciones como quieran." />
      <Container className="py-16">
        <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {sections.map((s) => (
            <StaggerItem key={s.id}>
              <SectionCard section={s} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </>
  );
}
