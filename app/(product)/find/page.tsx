"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { api } from "@/convex/_generated/api";
import { canJoinRun, spotsLeft } from "@/lib/matching";
import { formatPace, formatPaceBand, formatWhen, whoLabel, type WhoCanJoin } from "@/lib/types";
import { useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

const WHO_FILTERS: { id: "match" | WhoCanJoin | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "match", label: "For you" },
  { id: "open", label: "Open to all" },
  { id: "women", label: "Women only" },
  { id: "men", label: "Men only" },
];

export default function FindPage() {
  const me = useQuery(api.users.me);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const runs = useQuery(api.runs.list, { city: "Barcelona", now });
  const [who, setWho] = useState<(typeof WHO_FILTERS)[number]["id"]>("all");
  const [boardTimedOut, setBoardTimedOut] = useState(false);
  useEffect(() => {
    if (runs !== undefined) {
      setBoardTimedOut(false);
      return;
    }
    const timeoutId = window.setTimeout(() => setBoardTimedOut(true), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [runs]);
  const createHref = me
    ? "/find/new"
    : `/sign-in?next=${encodeURIComponent("/find/new")}`;

  const visible = useMemo(() => {
    if (!runs) {
      return [];
    }
    if (who === "all") {
      return runs;
    }
    if (who === "match") {
      if (!me) {
        return runs.filter((run) => run.whoCanJoin === "open");
      }
      return runs.filter((run) => canJoinRun(run, run.joinedCount, run.viewerJoined, me).ok);
    }
    return runs.filter((run) => run.whoCanJoin === who);
  }, [runs, me, who]);

  const boardEmpty = runs !== undefined && runs.length === 0;
  const filterEmpty = runs !== undefined && runs.length > 0 && visible.length === 0;

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <div className="relative">
        <div className="relative h-[42vh] min-h-[280px] overflow-hidden">
          <img
            src="/heroes/timesrun-hero-1.png"
            alt="Runner on a desert trail at golden hour"
            className="absolute inset-0 h-full w-full object-cover object-[center_40%] saturate-[0.82] contrast-[1.06] sepia-[0.18]"
          />
          <div className="absolute inset-0 bg-black/35" />
          <SiteHeader overlay />
          <div className="absolute inset-x-0 bottom-8 px-5 md:px-8">
            <p className="text-[11px] tracking-[0.28em] uppercase">Barcelona</p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em] md:text-7xl">
              Find
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {WHO_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setWho(filter.id)}
                className={`h-8 rounded-full border px-3 text-[10px] tracking-[0.18em] uppercase ${
                  who === filter.id
                    ? "border-[#f4efe6] bg-[#f4efe6] text-black"
                    : "border-white/25 text-[#f4efe6]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <a
            href={createHref}
            className="inline-flex h-8 items-center rounded-full border border-white px-4 text-[10px] tracking-[0.18em] uppercase hover:bg-white hover:text-black"
          >
            Create a run
          </a>
        </div>

        <p className="text-[11px] tracking-[0.12em] text-white/55 uppercase">
          {me
            ? `Easy pace ${formatPace(me.easyPaceMinPerKm)} /km${
                me.gender === "unspecified" ? " · set gender in You to join women/men only" : ""
              }`
            : "Sign in to match your pace and join"}
        </p>

        {runs === undefined ? (
          boardTimedOut ? (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm text-white/60">The board did not load.</p>
              <a
                href="/find"
                className="inline-flex h-8 items-center rounded-full border border-white px-4 text-[10px] tracking-[0.18em] uppercase hover:bg-white hover:text-black"
              >
                Retry
              </a>
            </div>
          ) : (
            <p className="text-sm text-white/60">Loading the board…</p>
          )
        ) : visible.length > 0 ? (
          <ul className="divide-y divide-white/15 border-t border-white/15">
            {visible.map((run) => {
              const left = spotsLeft(run.spots, run.joinedCount);
              return (
                <li key={run._id}>
                  <a href={`/runs/${run._id}`} className="block py-6 transition-opacity hover:opacity-80">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-[11px] tracking-[0.18em] uppercase">{formatWhen(run.startsAt)}</p>
                      <p className="text-[11px] tracking-[0.18em] uppercase">
                        {run.distanceKm} km · {formatPaceBand(run.paceMin, run.paceMax)}
                      </p>
                    </div>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.03em]">
                      {run.placeName}
                    </p>
                    {run.meetupNote ? (
                      <p className="mt-1 text-sm text-white/60">{run.meetupNote}</p>
                    ) : null}
                    {run.attendeeNames && run.attendeeNames.length > 0 ? (
                      <p className="mt-2 text-[11px] tracking-[0.12em] text-white/60 normal-case">
                        {run.joinedCount} going · {run.attendeeNames.join(", ")}
                        {run.joinedCount > run.attendeeNames.length ? "…" : ""}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] tracking-[0.16em] uppercase text-white/60">
                      <span>
                        {whoLabel(run.whoCanJoin)} · {left} {left === 1 ? "spot" : "spots"} left
                      </span>
                      <span className="text-[#f4efe6]">{run.viewerJoined ? "Going" : "Join"}</span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : boardEmpty ? (
          <div className="flex flex-col items-start gap-4 border-t border-white/15 pt-8">
            <p className="text-sm text-white/60">No runs this week. Create the first one.</p>
            <a
              href={createHref}
              className="inline-flex h-8 items-center rounded-full border border-white px-4 text-[10px] tracking-[0.18em] uppercase hover:bg-white hover:text-black"
            >
              Create a run
            </a>
          </div>
        ) : filterEmpty ? (
          <p className="text-sm text-white/60">
            No matching runs this week. Create one at a public pin, or open All.
          </p>
        ) : null}
      </div>
    </div>
  );
}
