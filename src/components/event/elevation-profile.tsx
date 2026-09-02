import type { GpxStats } from "@/lib/event-page";

/** Perfil de altimetría en SVG (renderizado en servidor). */
export function ElevationProfile({ stats }: { stats: GpxStats }) {
  const pts = stats.points;
  if (pts.length < 2) return null;
  const W = 800, H = 180, padL = 44, padB = 22, padT = 10;
  const minE = Math.floor(stats.minEle / 100) * 100;
  const maxE = Math.ceil(stats.maxEle / 100) * 100 || minE + 100;
  const x = (i: number) => padL + (i / (pts.length - 1)) * (W - padL - 8);
  const y = (e: number) => padT + (1 - (e - minE) / (maxE - minE)) * (H - padT - padB);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p[2]).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts.length - 1).toFixed(1)},${H - padB} L${padL},${H - padB} Z`;
  const ticks = [minE, Math.round((minE + maxE) / 2), maxE];
  const kmTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ f, km: (stats.distanceKm * f).toFixed(0) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Perfil de altimetría: de ${stats.minEle} a ${stats.maxEle} metros`}>
      <defs>
        <linearGradient id="ele" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e10600" stopOpacity="0.55" />
          <stop offset="1" stopColor="#e10600" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} stroke="#e7e7ea" strokeDasharray="3 3" />
          <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#6a6a79">{t} m</text>
        </g>
      ))}
      {kmTicks.map((k) => (
        <text key={k.f} x={padL + k.f * (W - padL - 8)} y={H - 6} textAnchor={k.f === 0 ? "start" : k.f === 1 ? "end" : "middle"} fontSize="11" fill="#6a6a79">{k.km} km</text>
      ))}
      <path d={area} fill="url(#ele)" />
      <path d={line} fill="none" stroke="#e10600" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
