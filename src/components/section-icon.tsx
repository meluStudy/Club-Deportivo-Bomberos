import { Bike, Dumbbell, Footprints, Goal, Mountain, Shield, Timer, Waves, Trophy, type LucideProps } from "lucide-react";

const Racket = (props: LucideProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="14" cy="9" rx="6.5" ry="7.5" transform="rotate(35 14 9)" />
    <path d="m9.5 14.5-6 6" />
    <path d="M12 6l4 4M11 9l3.5 3.5M14 5l3 3" />
  </svg>
);

const Basketball = (props: LucideProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M4.9 4.9c4 4 4 10.2 0 14.2M19.1 4.9c-4 4-4 10.2 0 14.2M2 12h20M12 2v20" />
  </svg>
);

const icons: Record<string, React.ComponentType<LucideProps>> = { Bike, Dribbble: Basketball, Dumbbell, Footprints, Goal, Mountain, Shield, Timer, Waves, Racket, Trophy };

export function SectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Trophy;
  return <Icon className={className} aria-hidden />;
}
