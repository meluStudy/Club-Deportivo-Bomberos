import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ stageId: string }> }) {
  const { stageId } = await params;
  const stage = await prisma.eventStage.findUnique({ where: { id: stageId }, include: { event: { select: { published: true, slug: true } } } });
  if (!stage || !stage.gpxData || !stage.event.published) return new Response("No encontrado", { status: 404 });
  const name = (stage.gpxName ?? `${stage.event.slug}-etapa.gpx`).replace(/[^\w.-]+/g, "_");
  return new Response(stage.gpxData, {
    headers: { "Content-Type": "application/gpx+xml; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "public, max-age=3600" },
  });
}
