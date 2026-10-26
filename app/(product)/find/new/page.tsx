"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { useT } from "@/app/components/i18n-provider";
import { MeetingPinMap, type MapPin } from "@/app/components/meeting-pin-map";
import { PaceField } from "@/app/components/pace-field";
import { RequireSignIn } from "@/app/components/require-sign-in";
import { api } from "@/convex/_generated/api";
import { isInBarcelona } from "@/convex/lib/barcelona";
import { parsePace, type WhoCanJoin } from "@/lib/types";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function NewRunPage() {
  const { t } = useT();
  const router = useRouter();
  const lookupPlace = useAction(api.geocode.lookup);
  const reversePlace = useAction(api.geocode.reverse);
  const createRun = useMutation(api.runs.create);
  const [placeName, setPlaceName] = useState("");
  const [pin, setPin] = useState<MapPin | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [finding, setFinding] = useState(false);

  async function onMapPin(next: MapPin) {
    if (!isInBarcelona(next.lat, next.lng)) {
      setError(t("pinMustBeBarcelona"));
      return;
    }
    setPin(next);
    setError("");
    try {
      const label = await reversePlace({ lat: next.lat, lng: next.lng });
      if (label) {
        setPlaceName(label);
      }
    } catch {
      // Keep the pin even if the label lookup fails.
    }
  }

  async function findTypedPlace() {
    const name = placeName.trim();
    if (!name) {
      setError(t("typeParkFirst"));
      return;
    }
    setFinding(true);
    setError("");
    try {
      const found = await lookupPlace({ placeName: name, city: "Barcelona" });
      if (!found || !isInBarcelona(found.lat, found.lng)) {
        setError(t("couldNotFindPlace"));
        return;
      }
      setPin(found);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("couldNotFindThatPlace"));
    } finally {
      setFinding(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const when = String(data.get("startsAt") ?? "");
    const distanceKm = Number(data.get("distanceKm"));
    const spots = Number(data.get("spots"));
    const paceMin = parsePace(String(data.get("paceMin") ?? ""));
    const paceMax = parsePace(String(data.get("paceMax") ?? ""));
    const whoCanJoin = String(data.get("whoCanJoin")) as WhoCanJoin;
    const meetupNote = String(data.get("meetupNote") ?? "").trim();
    const name = placeName.trim();

    if (!name || !when || !paceMin || !paceMax || !distanceKm || !spots) {
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
      const coords = pin ?? (await lookupPlace({ placeName: name, city: "Barcelona" }));
      if (!coords || !isInBarcelona(coords.lat, coords.lng)) {
        setError(t("dropPinBarcelona"));
        setPending(false);
        return;
      }
      const id = await createRun({
        startsAt: new Date(when).getTime(),
        distanceKm,
        paceMin,
        paceMax,
        spots,
        whoCanJoin,
        placeName: name,
        meetupNote: meetupNote || undefined,
        city: "Barcelona",
        lat: coords.lat,
        lng: coords.lng,
      });
      router.push(`/run/${id}?created=1`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("couldNotCreateRun"));
      setPending(false);
    }
  }

  return (
    <RequireSignIn>
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <SiteHeader />
      <div className="mx-auto max-w-xl px-5 py-12 md:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase">{t("publicPin")}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">
          {t("createRunTitle")}
        </h1>
        <form className="mt-10 flex flex-col gap-6" noValidate onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            {t("meetingPoint")}
            <div className="flex items-stretch gap-2">
              <input
                name="placeName"
                value={placeName}
                onChange={(event) => setPlaceName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void findTypedPlace();
                  }
                }}
                placeholder="Parc de la Ciutadella, Arc de Triomf"
                required
                className="h-11 min-w-0 flex-1 border border-white/20 bg-transparent px-3 text-base tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
              />
              <button
                type="button"
                onClick={() => void findTypedPlace()}
                disabled={finding}
                title={t("findThisLocation")}
                aria-label={t("findThisLocation")}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-white/20 hover:border-white disabled:opacity-50"
              >
                {finding ? (
                  <span className="text-[10px] tracking-[0.12em]">…</span>
                ) : (
                  <SearchMark />
                )}
              </button>
            </div>
            <span className="text-[11px] tracking-normal normal-case text-white/55">
              {t("typePlaceThenMark")}
            </span>
          </label>
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            {t("meetAt")}
            <input
              name="meetupNote"
              maxLength={140}
              placeholder="Under the Arc de Triomf"
              className="h-11 border border-white/20 bg-transparent px-3 text-base tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
            />
            <span className="text-[11px] tracking-normal normal-case text-white/55">
              {t("meetAtHint")}
            </span>
          </label>
          <div className="flex flex-col gap-2">
            <MeetingPinMap pin={pin} onPin={(next) => void onMapPin(next)} />
            <p className="text-[11px] tracking-[0.12em] text-white/55 uppercase">
              {t("tapMapToDropPin")}
            </p>
          </div>
          <Field label={t("when")} name="startsAt" type="datetime-local" maxSpotsMessage={t("maxSpots25")} />
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("distanceKm")} name="distanceKm" type="number" placeholder="8" maxSpotsMessage={t("maxSpots25")} />
            <Field label={t("spots")} name="spots" type="number" placeholder="8" min={2} max={25} maxSpotsMessage={t("maxSpots25")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PaceField label={t("paceFrom")} name="paceMin" placeholder="5:30" />
            <PaceField label={t("paceTo")} name="paceMax" placeholder="6:00" />
          </div>
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            {t("whoCanJoin")}
            <select
              name="whoCanJoin"
              defaultValue="open"
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
            {pending ? t("creating") : t("createRun")}
          </button>
        </form>
      </div>
    </div>
    </RequireSignIn>
  );
}

function SearchMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  min,
  max,
  maxSpotsMessage,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
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
