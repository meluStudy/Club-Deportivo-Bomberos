"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export function StageMap({ points, bounds, className }: { points: [number, number, number][]; bounds: [[number, number], [number, number]]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, { scrollWheelZoom: false });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 18 }).addTo(map);
      const latlngs = points.map((p) => [p[0], p[1]] as [number, number]);
      L.polyline(latlngs, { color: "#ffffff", weight: 7, opacity: 0.9 }).addTo(map);
      L.polyline(latlngs, { color: "#e10600", weight: 4 }).addTo(map);
      const marker = (pos: [number, number], label: string, color: string) =>
        L.circleMarker(pos, { radius: 8, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 }).bindTooltip(label, { permanent: true, direction: "top", offset: [0, -8] }).addTo(map);
      marker(latlngs[0], "Salida", "#0b0b0d");
      marker(latlngs[latlngs.length - 1], "Llegada", "#e10600");
      map.fitBounds(bounds, { padding: [30, 30] });
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points, bounds]);

  return <div ref={ref} className={className ?? "h-80 w-full sm:h-[28rem]"} role="img" aria-label="Mapa del recorrido de la etapa" />;
}
