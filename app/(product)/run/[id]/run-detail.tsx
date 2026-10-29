"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { useT } from "@/app/components/i18n-provider";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ANONYMOUS_RUNNER } from "@/convex/lib/names";
import { canJoinRun, paceFit, spotsLeft } from "@/lib/matching";
import { formatPace, formatWhen, mapsSearchUrl, type WhoCanJoin } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useEffect, useState } from "react";

type RunCard = FunctionReturnType<typeof api.runs.get>;

export function RunDetail({ runId: id, initialRun }: { runId: string; initialRun?: RunCard }) {
  const { t, locale } = useT();
  const runId = id as Id<"runs">;
  const me = useQuery(api.users.me);
  const liveRun = useQuery(api.runs.get, { runId });
  const run = liveRun === undefined ? initialRun : liveRun;
  const joinRun = useMutation(api.runs.join);
  const leaveRun = useMutation(api.runs.leave);
  const cancelRun = useMutation(api.runs.cancel);
  const [error, setError] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [hideName, setHideName] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("created") === "1") {
      setNotice(t("createdNotice"));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [t]);

  if (run === undefined) {
    return (
      <div className="min-h-svh bg-black text-[#f4efe6]">
        <AnnouncementBar />
        <SiteHeader />
        <p className="px-8 py-20 text-sm text-white/60">{t("loadingRun")}</p>
      </div>
    );
  }

  if (run === null) {
    return (
      <div className="min-h-svh bg-black text-[#f4efe6]">
        <AnnouncementBar />
        <SiteHeader />
        <p className="px-8 py-20 text-sm text-white/60">{t("runNotOnBoard")}</p>
      </div>
    );
  }

  const listed = run;
  const alreadyStarted = listed.startsAt <= Date.now();
  const gate = canJoinRun(listed, listed.joinedCount, listed.viewerJoined, me ?? null);
  const left = spotsLeft(listed.spots, listed.joinedCount);
  const maps = mapsSearchUrl(listed.placeName, listed.city);
  const paceWarning = (() => {
    if (!me || listed.viewerIsHost) {
      return null;
    }
    const fit = paceFit(listed, me.easyPaceMinPerKm);
    const band = `${formatPace(listed.paceMin)}–${formatPace(listed.paceMax)} /km`;
    if (fit === "faster") {
      return t("paceFaster", { pace: formatPace(me.easyPaceMinPerKm), band });
    }
    if (fit === "slower") {
      return t("paceSlower", { pace: formatPace(me.easyPaceMinPerKm), band });
    }
    return null;
  })();

  function whoText(whoCanJoin: WhoCanJoin) {
    if (whoCanJoin === "women") return t("whoWomen");
    if (whoCanJoin === "men") return t("whoMen");
    return t("whoOpen");
  }

  function joinBlockedMessage() {
    if (!me) return t("signInToJoinShort");
    if (listed.joinedCount >= listed.spots) return t("runFull");
    if (listed.whoCanJoin === "women" && me.gender !== "woman") return t("womenOnlyGate");
    if (listed.whoCanJoin === "men" && me.gender !== "man") return t("menOnlyGate");
    return gate.reason ?? "";
  }

  async function onJoin() {
    setError("");
    try {
      await joinRun({ runId, hideName });
      setNotice(t("joinedNotice"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("couldNotJoin"));
    }
  }

  async function onLeave() {
    setError("");
    try {
      await leaveRun({ runId });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("couldNotLeave"));
    }
  }

  async function onCancel() {
    if (!window.confirm(t("cancelConfirm"))) {
      return;
    }
    setError("");
    try {
      await cancelRun({ runId });
      window.location.href = "/find";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("couldNotCancel"));
    }
  }

  async function onShare() {
    setShareNote("");
    const url = window.location.href;
    const title = `${listed.placeName} · TimesRun Club`;
    const text = `${formatWhen(listed.startsAt, locale)} · ${listed.distanceKm} km · ${t("paceBand", { min: formatPace(listed.paceMin), max: formatPace(listed.paceMax) })}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (caught) {
      if (caught instanceof Error && caught.name === "AbortError") {
        return;
      }
    }
    if (await copyText(url)) {
      setShareNote(t("linkCopied"));
    } else {
      setShareNote(t("couldNotCopy"));
    }
  }

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <div className="relative h-[46vh] min-h-[300px] overflow-hidden">
        <img
          src="/heroes/timesrun-hero-1.jpg"
            alt={t("altDesert")}
          className="absolute inset-0 h-full w-full object-cover object-[center_35%] saturate-[0.82] contrast-[1.06] sepia-[0.18]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <SiteHeader overlay />
        <div className="absolute inset-x-0 bottom-8 px-5 md:px-8">
          <p className="text-[11px] tracking-[0.28em] uppercase">{listed.city}</p>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-[-0.04em] md:text-6xl">
            {listed.placeName}
          </h1>
        </div>
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-8 px-5 py-12 md:px-8">
        <dl className="grid grid-cols-2 gap-6 text-[11px] tracking-[0.16em] uppercase">
          <div>
            <dt className="text-white/45">{t("when")}</dt>
            <dd className="mt-1 text-sm tracking-normal normal-case">{formatWhen(listed.startsAt, locale)}</dd>
          </div>
          <div>
            <dt className="text-white/45">{t("distance")}</dt>
            <dd className="mt-1 text-sm tracking-normal normal-case">{listed.distanceKm} km</dd>
          </div>
          <div>
            <dt className="text-white/45">{t("pace")}</dt>
            <dd className="mt-1 text-sm tracking-normal normal-case">
              {t("paceRange", { min: formatPace(listed.paceMin), max: formatPace(listed.paceMax) })}
            </dd>
          </div>
          <div>
            <dt className="text-white/45">{t("who")}</dt>
            <dd className="mt-1 text-sm tracking-normal normal-case">{whoText(listed.whoCanJoin)}</dd>
          </div>
          {listed.meetupNote ? (
            <div className="col-span-2">
              <dt className="text-white/45">{t("meetAt")}</dt>
              <dd className="mt-1 text-sm tracking-normal normal-case">{listed.meetupNote}</dd>
            </div>
          ) : null}
        </dl>
        {listed.whoCanJoin !== "open" ? (
          <p className="-mt-4 text-[11px] tracking-normal normal-case text-white/55">
            {t("genderUnverified")}
          </p>
        ) : null}

        {notice ? (
          <p className="border border-[#d8b878]/40 bg-[#d8b878]/10 px-4 py-3 text-sm text-[#d8b878]">
            {notice}
          </p>
        ) : null}

        {paceWarning ? (
          <p className="border border-white/20 px-4 py-3 text-sm text-white/80">{paceWarning}</p>
        ) : null}

        <p className="text-sm text-white/70">
          {t("spotsLeftLine", {
            left,
            spotsWord: left === 1 ? t("spotWord") : t("spotsWord"),
            going: run.joinedCount,
          })}
        </p>

        {listed.attendeeNames ? (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/45">{t("goingHeading")}</p>
            <ul className="flex flex-col gap-1 text-sm text-white/70">
              {listed.attendeeNames.map((name, index) => (
                <li key={`${name}-${index}`}>{name === ANONYMOUS_RUNNER ? t("anonymousRunner") : name}</li>
              ))}
            </ul>
          </div>
        ) : listed.whoCanJoin !== "open" && me && !listed.viewerJoined ? (
          <p className="text-sm text-white/55">{t("joinToSeeWho")}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase"
          >
            <span aria-hidden className="text-base leading-none">
              📍
            </span>
            <span className="underline">{t("openMap")}</span>
          </a>
          <button
            type="button"
            onClick={() => void onShare()}
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase"
          >
            <ShareMark />
            <span className="underline">{t("share")}</span>
          </button>
          {shareNote ? <span className="text-[11px] tracking-[0.16em] uppercase text-white/55">{shareNote}</span> : null}
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        {listed.viewerIsHost ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-white/70">{t("hostingThis")}</p>
            <Link
              href={`/runs/${listed._id}/edit`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
            >
              {t("editRun")}
            </Link>
            <button
              type="button"
              onClick={() => void onCancel()}
              className="text-[11px] tracking-[0.2em] uppercase underline"
            >
              {t("cancelRun")}
            </button>
          </div>
        ) : listed.viewerJoined ? (
          <button
            type="button"
            onClick={() => void onLeave()}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
          >
            {t("leaveRun")}
          </button>
        ) : alreadyStarted ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-white/70">{t("runEnded")}</p>
            <Link href="/find" className="text-[11px] tracking-[0.2em] uppercase underline">
              {t("findARun")}
            </Link>
          </div>
        ) : gate.ok ? (
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={hideName}
                onChange={(event) => setHideName(event.target.checked)}
                className="mt-1"
              />
              {t("joinWithoutName")}
            </label>
            <button
              type="button"
              onClick={() => void onJoin()}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
            >
              {paceWarning ? t("joinAnyway") : t("join")}
            </button>
          </div>
        ) : !me ? (
          <Link
            href={`/sign-in?next=${encodeURIComponent(`/run/${listed._id}`)}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
          >
            {t("join")}
          </Link>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-white/70">{joinBlockedMessage()}</p>
            <Link href="/you" className="text-[11px] tracking-[0.2em] uppercase underline">
              {t("updateProfile")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.7 10.7 15.3 6.3M8.7 13.3 15.3 17.7" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

async function copyText(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    const input = document.createElement("textarea");
    input.value = url;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    input.remove();
    return copied;
  }
}
