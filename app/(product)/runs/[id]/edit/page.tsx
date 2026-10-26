"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { useT } from "@/app/components/i18n-provider";
import { PaceField } from "@/app/components/pace-field";
import { RequireSignIn } from "@/app/components/require-sign-in";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { isInBarcelona } from "@/convex/lib/barcelona";
import { formatDatetimeLocal, formatPace, parsePace, type WhoCanJoin } from "@/lib/types";
import { useAction, useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function EditRunPage() {
  const { t } = useT();
  const params = useParams<{ id: string }>();
  const runId = params.id as Id<"runs">;
  const router = useRouter();
  const run = useQuery(api.runs.get, { runId });
  const lookupPlace = useAction(api.geocode.lookup);
  const updateRun = useMutation(api.runs.update);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!run) {
      return;
    }
    const data = new FormData(event.currentTarget);
    const placeName = String(data.get("placeName") ?? "").trim();
    const when = String(data.get("startsAt") ?? "");
    const distanceKm = Number(data.get("distanceKm"));
    const spots = Number(data.get("spots"));
    const paceMin = parsePace(String(data.get("paceMin") ?? ""));
    const paceMax = parsePace(String(data.get("paceMax") ?? ""));
    const whoCanJoin = String(data.get("whoCanJoin")) as WhoCanJoin;
    const meetupNote = String(data.get("meetupNote") ?? "").trim();

    if (!placeName || !when || !paceMin || !paceMax || !distanceKm || !spots) {
      setError(t("fillEveryField"));
      return;
    }
    if (spots > 25) {
      setError(t("maxSpots25"));
      return;
    }
    if (paceMax < paceMin) {
      setError(t("slowerEndHigher"));
      return;
    }
    if (new Date(when).getTime() < Date.now() - 5 * 60 * 1000) {
      setError(t("mustStartFuture"));
      return;
    }

    setPending(true);
    try {
      let lat = run.lat;
      let lng = run.lng;
      if (placeName !== run.placeName) {
        const pin = await lookupPlace({ placeName, city: "Barcelona" });
        if (!pin || !isInBarcelona(pin.lat, pin.lng)) {
          setError(t("couldNotFindEdit"));
          setPending(false);
          return;
        }
        lat = pin.lat;
        lng = pin.lng;
      }
      await updateRun({
        runId,
        startsAt: new Date(when).getTime(),
        distanceKm,
        paceMin,
        paceMax,
        spots,
        whoCanJoin,
        placeName,
        meetupNote,
        city: "Barcelona",
        lat,
        lng,
      });
      router.push(`/run/${runId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("couldNotSaveRun"));
      setPending(false);
    }
  }

  return (
    <RequireSignIn>
      <div className="min-h-svh bg-black text-[#f4efe6]">
        <AnnouncementBar />
        <SiteHeader />
        {run === undefined ? (
          <p className="px-8 py-20 text-sm text-white/60">{t("loadingRun")}</p>
        ) : run === null || !run.viewerIsHost ? (
          <p className="px-8 py-20 text-sm text-white/60">{t("onlyHostCanEdit")}</p>
        ) : (
          <div className="mx-auto max-w-xl px-5 py-12 md:px-8">
            <p className="text-[11px] tracking-[0.28em] uppercase">{t("publicPin")}</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">
              {t("editRunTitle")}
            </h1>
            <form className="mt-10 flex flex-col gap-6" noValidate onSubmit={(event) => void onSubmit(event)}>
              <Field
                label={t("meetingPoint")}
                name="placeName"
                placeholder="Parc de la Ciutadella, Arc de Triomf"
                defaultValue={run.placeName}
                maxSpotsMessage={t("maxSpots25")}
              />
              <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
                {t("meetAt")}
                <input
                  name="meetupNote"
                  maxLength={140}
                  defaultValue={run.meetupNote ?? ""}
                  placeholder="Under the Arc de Triomf"
                  className="h-11 border border-white/20 bg-transparent px-3 text-base tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
                />
                <span className="text-[11px] tracking-normal normal-case text-white/55">
                  {t("meetAtHint")}
                </span>
              </label>
              <Field label={t("when")} name="startsAt" type="datetime-local" defaultValue={formatDatetimeLocal(run.startsAt)} maxSpotsMessage={t("maxSpots25")} />
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("distanceKm")} name="distanceKm" type="number" defaultValue={String(run.distanceKm)} maxSpotsMessage={t("maxSpots25")} />
                <Field label={t("spots")} name="spots" type="number" defaultValue={String(run.spots)} min={2} max={25} maxSpotsMessage={t("maxSpots25")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <PaceField label={t("paceFrom")} name="paceMin" defaultValue={formatPace(run.paceMin)} />
                <PaceField label={t("paceTo")} name="paceMax" defaultValue={formatPace(run.paceMax)} />
              </div>
              <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
                {t("whoCanJoin")}
                <select
                  name="whoCanJoin"
                  defaultValue={run.whoCanJoin}
                  className="h-11 border border-white/20 bg-black px-3 text-base tracking-normal normal-case text-[#f4efe6]"
                >
                  <option value="open">{t("whoOpen")}</option>
                  <option value="women">{t("whoWomen")}</option>
                  <option value="men">{t("whoMen")}</option>
                </select>
                <span className="text-[11px] tracking-normal normal-case text-white/55">
                  {t("genderUnverified")}
                </span>
              </label>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <button
                type="submit"
                disabled={pending}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black disabled:opacity-50"
              >
                {pending ? t("saving") : t("saveChanges")}
              </button>
            </form>
          </div>
        )}
      </div>
    </RequireSignIn>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  min,
  max,
  maxSpotsMessage,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  min?: number;
  max?: number;
  maxSpotsMessage: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required
        step={type === "number" ? "1" : undefined}
        min={type === "number" ? String(min ?? 1) : undefined}
        max={max !== undefined ? String(max) : undefined}
        onInput={(event) => event.currentTarget.setCustomValidity("")}
        onInvalid={(event) => {
          if (max !== undefined && event.currentTarget.validity.rangeOverflow) {
            event.currentTarget.setCustomValidity(maxSpotsMessage);
          }
        }}
        className="h-11 border border-white/20 bg-transparent px-3 text-base tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
      />
    </label>
  );
}
