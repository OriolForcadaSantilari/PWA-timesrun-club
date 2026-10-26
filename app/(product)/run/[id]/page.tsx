import { baseOpenGraph } from "@/app/shared-metadata";
import { getPublicRun, type RunCard } from "@/lib/server-runs";
import { formatPace, formatRunTitleDate, type WhoCanJoin } from "@/lib/types";
import type { Metadata } from "next";
import { RunDetail } from "./run-detail";

export const revalidate = 300;

const SITE_URL = "https://www.timesrun.club";

type Props = { params: Promise<{ id: string }> };

const WHO_ES: Record<WhoCanJoin, string> = {
  open: "Abierto a todos",
  women: "Solo mujeres",
  men: "Solo hombres",
};

function runName(run: RunCard) {
  return `Run ${run.distanceKm} km en ${run.placeName}`;
}

function runDescription(run: RunCard) {
  const left = Math.max(0, run.spots - run.joinedCount);
  const spots = left === 0 ? "Completo" : left === 1 ? "1 plaza libre" : `${left} plazas libres`;
  const base = `${WHO_ES[run.whoCanJoin]} · ${run.distanceKm} km a ritmo ${formatPace(run.paceMin)}–${formatPace(run.paceMax)} /km en ${run.placeName}, ${run.city}. ${formatRunTitleDate(run.startsAt)}.`;
  if (run.startsAt <= Date.now()) {
    return `Este run ya ha terminado. ${base}`;
  }
  return `${base} ${spots}. Únete en TimesRun Club.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const run = await getPublicRun(id);
  if (!run) {
    return {
      title: "Run no encontrado | TimesRun Club",
      robots: { index: false },
    };
  }
  const title = `${runName(run)} · ${formatRunTitleDate(run.startsAt)} | TimesRun Club`;
  const description = runDescription(run);
  const url = `${SITE_URL}/run/${run._id}`;
  return {
    title,
    description,
    alternates: { canonical: `/run/${run._id}` },
    openGraph: { ...baseOpenGraph, title, description, url },
  };
}

export default async function RunPage({ params }: Props) {
  const { id } = await params;
  const run = await getPublicRun(id);
  const jsonLd = run
    ? {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: runName(run),
        description: runDescription(run),
        url: `${SITE_URL}/run/${run._id}`,
        startDate: new Date(run.startsAt).toISOString(),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: run.placeName,
          address: {
            "@type": "PostalAddress",
            addressLocality: run.city,
            addressCountry: "ES",
          },
        },
        organizer: {
          "@type": "Organization",
          name: "TimesRun Club",
          url: SITE_URL,
        },
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <RunDetail runId={id} initialRun={run} />
    </>
  );
}
