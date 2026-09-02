import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex flex-1 items-center overflow-hidden bg-ink-950 text-white">
      <div className="absolute inset-0 bg-stripes" aria-hidden />
      <Container className="relative py-32 text-center">
        <p className="font-display text-9xl font-extrabold text-gradient">404</p>
        <h1 className="mt-2 text-4xl font-extrabold uppercase">Página no encontrada</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-300">La página que buscas no existe o se ha movido.</p>
        <div className="mt-8"><ButtonLink href="/">Volver al inicio</ButtonLink></div>
      </Container>
    </div>
  );
}
