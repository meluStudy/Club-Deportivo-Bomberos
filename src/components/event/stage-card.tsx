import { ArrowRight, Clock, Download, Flag, MapPin, Mountain, Ruler } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/ui/reveal";
import { parseGpxStats, parseSchedule } from "@/lib/event-page";
import { formatDate } from "@/lib/utils";
import { StageMap } from "./stage-map";
import { ElevationProfile } from "./elevation-profile";

type Stage = {
  id: string; name: string; date: Date | null; startTime: string | null; startPlace: string | null; endPlace: string | null;
  distanceKm: number | null; elevationM: number | null; description: string | null; schedule: string | null; gpxName: string | null; gpxStats: string | null;
};

export function StageCard({ stage, index }: { stage: Stage; index: number }) {
  const stats = parseGpxStats(stage.gpxStats);
  const schedule = parseSchedule(stage.schedule);
  const km = stage.distanceKm ?? stats?.distanceKm;
  const ele = stage.elevationM ?? stats?.elevationGain;

  return (
    <Reveal as="article" className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card">
      <header className="flex flex-col gap-4 border-b border-ink-100 bg-ink-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Etapa {index + 1}</p>
          <h2 className="mt-1 text-3xl font-extrabold uppercase leading-none">{stage.name}</h2>
          {stage.date && <p className="mt-2 text-sm text-ink-300 capitalize">{formatDate(stage.date, { weekday: "long", day: "numeric", month: "long" })}{stage.startTime ? ` · salida ${stage.startTime}` : ""}</p>}
        </div>
        <dl className="flex gap-6">
          {km != null && <div><dt className="flex items-center gap-1 text-xs text-ink-400"><Ruler className="size-3.5" /> Distancia</dt><dd className="font-display text-3xl font-extrabold">{km} km</dd></div>}
          {ele != null && <div><dt className="flex items-center gap-1 text-xs text-ink-400"><Mountain className="size-3.5" /> Desnivel +</dt><dd className="font-display text-3xl font-extrabold">{ele} m</dd></div>}
        </dl>
      </header>

      {(stage.startPlace || stage.endPlace) && (
        <div className="flex flex-col gap-2 border-b border-ink-100 px-6 py-4 text-sm sm:flex-row sm:items-center sm:gap-4">
          {stage.startPlace && <span className="flex items-center gap-2"><MapPin className="size-4 text-ink-950" /> <strong>Salida:</strong> {stage.startPlace}</span>}
          {stage.startPlace && stage.endPlace && <ArrowRight className="hidden size-4 text-ink-400 sm:block" />}
          {stage.endPlace && <span className="flex items-center gap-2"><Flag className="size-4 text-brand-600" /> <strong>Llegada:</strong> {stage.endPlace}</span>}
        </div>
      )}

      {stats && (
        <div>
          <StageMap points={stats.points} bounds={stats.bounds} />
          <div className="border-t border-ink-100 px-4 pt-4">
            <ElevationProfile stats={stats} />
          </div>
        </div>
      )}

      <div className="grid gap-8 p-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {stage.description && <Markdown content={stage.description} />}
          {stats && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a href={`/api/gpx/${stage.id}`} className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600">
                <Download className="size-4" /> Descargar GPX
              </a>
              <span className="text-xs text-ink-500">{stage.gpxName} · {stats.distanceKm} km · +{stats.elevationGain} m / −{stats.elevationLoss} m · {stats.minEle}–{stats.maxEle} m</span>
            </div>
          )}
        </div>
        {schedule.length > 0 && (
          <div className="lg:col-span-2">
            <h3 className="mb-3 flex items-center gap-2 text-xl font-bold uppercase"><Clock className="size-5 text-brand-600" /> Horario de la etapa</h3>
            <ol className="relative space-y-3 border-l-2 border-ink-100 pl-5">
              {schedule.map((s, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.6rem] top-1.5 size-3 rounded-full border-2 border-white bg-brand-600" aria-hidden />
                  <span className="font-display text-lg font-bold">{s.time}</span> <span className="font-semibold">{s.title}</span>
                  {s.place && <span className="block text-sm text-ink-500">{s.place}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Reveal>
  );
}
