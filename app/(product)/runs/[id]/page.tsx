"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { canJoinRun, paceFitMessage, spotsLeft } from "@/lib/matching";
import { formatPace, formatPaceBand, formatWhen, mapsSearchUrl, whoLabel } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RunDetailPage() {
  const params = useParams<{ id: string }>();
  const runId = params.id as Id<"runs">;
  const me = useQuery(api.users.me);
  const run = useQuery(api.runs.get, { runId });
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
      setNotice("The run is on the board. See you at the pin.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (run === undefined) {
    return (
      <div className="min-h-svh bg-black text-[#f4efe6]">
        <AnnouncementBar />
        <SiteHeader />
        <p className="px-8 py-20 text-sm text-white/60">Loading this run…</p>
      </div>
    );
  }

  if (run === null) {
    return (
      <div className="min-h-svh bg-black text-[#f4efe6]">
        <AnnouncementBar />
        <SiteHeader />
        <p className="px-8 py-20 text-sm text-white/60">This run is not on the board.</p>
      </div>
    );
  }

  const listed = run;
  const alreadyStarted = listed.startsAt <= Date.now();
  const gate = canJoinRun(listed, listed.joinedCount, listed.viewerJoined, me ?? null);
  const left = spotsLeft(listed.spots, listed.joinedCount);
  const maps = mapsSearchUrl(listed.placeName, listed.city);
  const paceWarning =
    me && !listed.viewerIsHost ? paceFitMessage(listed, me.easyPaceMinPerKm) : null;

  async function onJoin() {
    setError("");
    try {
      await joinRun({ runId, hideName });
      setNotice("You're in. See you at the pin.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not join.");
    }
  }

  async function onLeave() {
    setError("");
    try {
      await leaveRun({ runId });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not leave.");
    }
  }

  async function onCancel() {
    if (!window.confirm("Cancel this run? It comes off the board. People who joined will no longer see it.")) {
      return;
    }
    setError("");
    try {
      await cancelRun({ runId });
      window.location.href = "/find";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not cancel.");
    }
  }

  async function onShare() {
    setShareNote("");
    const url = window.location.href;
    const title = `${listed.placeName} · TimesRun Club`;
    const text = `${formatWhen(listed.startsAt)} · ${listed.distanceKm} km · ${formatPaceBand(listed.paceMin, listed.paceMax)}`;
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
      setShareNote("Link copied");
    } else {
      setShareNote("Could not copy the link");
    }
  }

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <div className="relative h-[46vh] min-h-[300px] overflow-hidden">
        <img
          src="/heroes/timesrun-hero-1.png"
          alt="Runner on a desert trail at golden hour"
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
            <dt className="text-white/45">When</dt>
            <dd className="mt-1 text-sm tracking-normal normal-case">{formatWhen(listed.startsAt)}</dd>
          </div>
          <div>
            <dt className="text-white/45">Distance</dt>
            <dd className="mt-1 text-sm tracking-normal normal-case">{listed.distanceKm} km</dd>
          </div>
          <div>
            <dt className="text-white/45">Pace</dt>
            <dd className="mt-1 text-sm tracking-normal normal-case">
              {formatPace(listed.paceMin)} to {formatPace(listed.paceMax)} /km
            </dd>
          </div>
          <div>
            <dt className="text-white/45">Who</dt>
            <dd className="mt-1 text-sm tracking-normal normal-case">{whoLabel(listed.whoCanJoin)}</dd>
          </div>
          {listed.meetupNote ? (
            <div className="col-span-2">
              <dt className="text-white/45">Meet at</dt>
              <dd className="mt-1 text-sm tracking-normal normal-case">{listed.meetupNote}</dd>
            </div>
          ) : null}
        </dl>
        {listed.whoCanJoin !== "open" ? (
          <p className="-mt-4 text-[11px] tracking-normal normal-case text-white/55">
            Based on the gender members choose on their profile. We do not verify it.
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
          {left} {left === 1 ? "spot" : "spots"} left · {run.joinedCount} going. Meet at the public pin — not a
          private address.
        </p>

        {listed.attendeeNames ? (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/45">Going</p>
            <ul className="flex flex-col gap-1 text-sm text-white/70">
              {listed.attendeeNames.map((name, index) => (
                <li key={`${name}-${index}`}>{name}</li>
              ))}
            </ul>
          </div>
        ) : listed.whoCanJoin !== "open" && me && !listed.viewerJoined ? (
          <p className="text-sm text-white/55">Join to see who is going.</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href={maps} target="_blank" rel="noreferrer" className="text-[11px] tracking-[0.2em] uppercase underline">
            Open map
          </a>
          <button
            type="button"
            onClick={() => void onShare()}
            className="text-[11px] tracking-[0.2em] uppercase underline"
          >
            Share
          </button>
          {shareNote ? <span className="text-[11px] tracking-[0.16em] uppercase text-white/55">{shareNote}</span> : null}
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        {listed.viewerIsHost ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-white/70">You're hosting this run.</p>
            <Link
              href={`/runs/${listed._id}/edit`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
            >
              Edit run
            </Link>
            <button
              type="button"
              onClick={() => void onCancel()}
              className="text-[11px] tracking-[0.2em] uppercase underline"
            >
              Cancel run
            </button>
          </div>
        ) : listed.viewerJoined ? (
          <button
            type="button"
            onClick={() => void onLeave()}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
          >
            Leave run
          </button>
        ) : alreadyStarted ? (
          <p className="text-sm text-white/70">This run has already started.</p>
        ) : gate.ok ? (
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={hideName}
                onChange={(event) => setHideName(event.target.checked)}
                className="mt-1"
              />
              Join without showing my name
            </label>
            <button
              type="button"
              onClick={() => void onJoin()}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
            >
              {paceWarning ? "Join anyway" : "Join"}
            </button>
          </div>
        ) : !me ? (
          <Link
            href={`/sign-in?next=${encodeURIComponent(`/runs/${listed._id}`)}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
          >
            Sign in to join
          </Link>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-white/70">{gate.reason}</p>
            <Link href="/you" className="text-[11px] tracking-[0.2em] uppercase underline">
              Update your profile
            </Link>
          </div>
        )}
      </div>
    </div>
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
