"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { useT } from "@/app/components/i18n-provider";
import { api } from "@/convex/_generated/api";
import { ANONYMOUS_RUNNER } from "@/convex/lib/names";
import { canJoinRun, spotsLeft } from "@/lib/matching";
import { formatPace, formatWhen, type WhoCanJoin } from "@/lib/types";
import type { MessageKey } from "@/lib/i18n";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useEffect, useMemo, useState } from "react";

type RunCards = FunctionReturnType<typeof api.runs.list>;

type PaceFilterId = "pace-430-530" | "pace-530-630";

const PACE_FILTERS: Record<PaceFilterId, { min: number; max: number }> = {
  "pace-430-530": { min: 4.5, max: 5.5 },
  "pace-530-630": { min: 5.5, max: 6.5 },
};

const WHO_FILTERS: ({ id: "match" | WhoCanJoin | "all"; labelKey: MessageKey } | { id: PaceFilterId; label: string })[] = [
  { id: "all", labelKey: "filterAll" },
  { id: "match", labelKey: "filterForYou" },
  { id: "open", labelKey: "filterOpen" },
  { id: "women", labelKey: "filterWomen" },
  { id: "men", labelKey: "filterMen" },
  { id: "pace-430-530", label: "4:30-5:30" },
  { id: "pace-530-630", label: "5:30-6:30" },
];

function isPaceFilter(id: string): id is PaceFilterId {
  return id in PACE_FILTERS;
}

function inPaceRange(run: { paceMin: number; paceMax: number }, range: { min: number; max: number }) {
  const overlaps = run.paceMin < range.max && run.paceMax > range.min;
  const inside = run.paceMin >= range.min && run.paceMax <= range.max;
  return overlaps || inside;
}

export function FindBoard({ initialRuns }: { initialRuns?: RunCards }) {
  const { t, locale } = useT();
  const me = useQuery(api.users.me);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const liveRuns = useQuery(api.runs.list, { city: "Barcelona", now });
  const runs = liveRuns ?? initialRuns;
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
    if (isPaceFilter(who)) {
      const range = PACE_FILTERS[who];
      return runs.filter((run) => inPaceRange(run, range));
    }
    return runs.filter((run) => run.whoCanJoin === who);
  }, [runs, me, who]);

  const boardEmpty = runs !== undefined && runs.length === 0;
  const filterEmpty = runs !== undefined && runs.length > 0 && visible.length === 0;

  function whoText(whoCanJoin: WhoCanJoin) {
    if (whoCanJoin === "women") return t("whoWomen");
    if (whoCanJoin === "men") return t("whoMen");
    return t("whoOpen");
  }

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <div className="relative">
        <div className="relative h-[42vh] min-h-[280px] overflow-hidden">
          <img
            src="/heroes/timesrun-hero-1.png"
            alt={t("altDesert")}
            className="absolute inset-0 h-full w-full object-cover object-[center_40%] saturate-[0.82] contrast-[1.06] sepia-[0.18]"
          />
          <div className="absolute inset-0 bg-black/35" />
          <SiteHeader overlay />
          <div className="absolute inset-x-0 bottom-8 px-5 md:px-8">
            <p className="text-[11px] tracking-[0.28em] uppercase">Barcelona</p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em] md:text-7xl">
              {t("findTitle")}
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
                className={`h-8 rounded-full border px-3 text-[10px] tracking-[0.18em] whitespace-nowrap uppercase ${
                  who === filter.id
                    ? "border-[#f4efe6] bg-[#f4efe6] text-black"
                    : "border-white/25 text-[#f4efe6]"
                }`}
              >
                {"labelKey" in filter ? t(filter.labelKey) : filter.label}
              </button>
            ))}
          </div>
          <a
            href={createHref}
            className="inline-flex h-8 items-center rounded-full border border-white px-4 text-[10px] tracking-[0.18em] uppercase hover:bg-white hover:text-black"
          >
            {t("createARun")}
          </a>
        </div>

        <p className="text-[11px] tracking-[0.12em] text-white/55 uppercase">
          {me
            ? `${t("easyPaceLine", { pace: formatPace(me.easyPaceMinPerKm) })}${
                me.gender === "unspecified" ? t("easyPaceSetGender") : ""
              }`
            : t("signInToMatch")}
        </p>

        {runs === undefined ? (
          boardTimedOut ? (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm text-white/60">{t("boardDidNotLoad")}</p>
              <a
                href="/find"
                className="inline-flex h-8 items-center rounded-full border border-white px-4 text-[10px] tracking-[0.18em] uppercase hover:bg-white hover:text-black"
              >
                {t("retry")}
              </a>
            </div>
          ) : (
            <p className="text-sm text-white/60">{t("loadingBoard")}</p>
          )
        ) : visible.length > 0 ? (
          <ul className="divide-y divide-white/15 border-t border-white/15">
            {visible.map((run) => {
              const left = spotsLeft(run.spots, run.joinedCount);
              return (
                <li key={run._id}>
                  <a href={`/run/${run._id}`} className="block py-6 transition-opacity hover:opacity-80">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <p className="text-[11px] tracking-[0.18em] uppercase">{formatWhen(run.startsAt, locale)}</p>
                      <p className="text-[11px] tracking-[0.18em] whitespace-nowrap uppercase">
                        {run.distanceKm} km · {t("paceBand", { min: formatPace(run.paceMin), max: formatPace(run.paceMax) })}
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
                        {t("goingList", {
                          count: run.joinedCount,
                          names: run.attendeeNames
                            .map((name) => (name === ANONYMOUS_RUNNER ? t("anonymousRunner") : name))
                            .join(", "),
                        })}
                        {run.joinedCount > run.attendeeNames.length ? "…" : ""}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] tracking-[0.16em] uppercase text-white/60">
                      <span>
                        {whoText(run.whoCanJoin)} ·{" "}
                        {left === 1
                          ? t("spotsLeftOne", { n: left })
                          : t("spotsLeftMany", { n: left })}
                      </span>
                      <span className="text-[#f4efe6]">{run.viewerJoined ? t("statusGoing") : t("statusJoin")}</span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : boardEmpty ? (
          <div className="flex flex-col items-start gap-4 border-t border-white/15 pt-8">
            <p className="text-sm text-white/60">{t("noRunsThisWeek")}</p>
            <a
              href={createHref}
              className="inline-flex h-8 items-center rounded-full border border-white px-4 text-[10px] tracking-[0.18em] uppercase hover:bg-white hover:text-black"
            >
              {t("createARun")}
            </a>
          </div>
        ) : filterEmpty ? (
          <p className="text-sm text-white/60">{t("noMatchingRuns")}</p>
        ) : null}
      </div>
    </div>
  );
}
