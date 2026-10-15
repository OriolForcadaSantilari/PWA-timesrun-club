"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
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
      setError("The meeting pin must be in Barcelona.");
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
      setError("Type a park, plaza, or beach, then find it on the map.");
      return;
    }
    setFinding(true);
    setError("");
    try {
      const found = await lookupPlace({ placeName: name, city: "Barcelona" });
      if (!found || !isInBarcelona(found.lat, found.lng)) {
        setError("Could not find that meeting point in Barcelona. Tap the map, or try another name.");
        return;
      }
      setPin(found);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not find that place.");
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
    const name = placeName.trim();

    if (!name || !when || !paceMin || !paceMax || !distanceKm || !spots) {
      setError("Fill every field. Pace looks like 5:45.");
      return;
    }
    if (paceMax < paceMin) {
      setError("The slower end of the band must be higher than the faster end.");
      return;
    }
    if (new Date(when).getTime() < Date.now() - 5 * 60 * 1000) {
      setError("The run must start in the future.");
      return;
    }

    setPending(true);
    try {
      const coords = pin ?? (await lookupPlace({ placeName: name, city: "Barcelona" }));
      if (!coords || !isInBarcelona(coords.lat, coords.lng)) {
        setError("Drop a pin on the map in Barcelona, or type a park, plaza, or beach in the city.");
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
        city: "Barcelona",
        lat: coords.lat,
        lng: coords.lng,
      });
      router.push(`/runs/${id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the run.");
      setPending(false);
    }
  }

  return (
    <RequireSignIn>
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <SiteHeader />
      <div className="mx-auto max-w-xl px-5 py-12 md:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase">Public pin</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">
          Create a run
        </h1>
        <form className="mt-10 flex flex-col gap-6" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            Meeting point
            <input
              name="placeName"
              value={placeName}
              onChange={(event) => setPlaceName(event.target.value)}
              placeholder="Parc de la Ciutadella, Arc de Triomf"
              required
              className="h-11 border border-white/20 bg-transparent px-3 text-sm tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
            />
          </label>
          <div className="flex flex-col gap-2">
            <MeetingPinMap pin={pin} onPin={(next) => void onMapPin(next)} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] tracking-[0.12em] text-white/55 uppercase">
                Tap the map to drop the pin
              </p>
              <button
                type="button"
                onClick={() => void findTypedPlace()}
                disabled={finding}
                className="text-[11px] tracking-[0.18em] uppercase underline disabled:opacity-50"
              >
                {finding ? "Finding…" : "Find this name"}
              </button>
            </div>
          </div>
          <Field label="When" name="startsAt" type="datetime-local" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Distance km" name="distanceKm" type="number" placeholder="8" />
            <Field label="Spots" name="spots" type="number" placeholder="8" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PaceField label="Pace from" name="paceMin" placeholder="5:30" />
            <PaceField label="Pace to" name="paceMax" placeholder="6:00" />
          </div>
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            Who can join
            <select
              name="whoCanJoin"
              defaultValue="open"
              className="h-11 border border-white/20 bg-black px-3 text-sm tracking-normal normal-case text-[#f4efe6]"
            >
              <option value="open">Open to all</option>
              <option value="women">Women only</option>
              <option value="men">Men only</option>
            </select>
            <span className="text-[11px] tracking-normal normal-case text-white/55">
              Based on the gender members choose on their profile. We do not verify it.
            </span>
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black disabled:opacity-50"
          >
            {pending ? "Opening…" : "Open the run"}
          </button>
        </form>
      </div>
    </div>
    </RequireSignIn>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
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
        min={type === "number" ? "1" : undefined}
        className="h-11 border border-white/20 bg-transparent px-3 text-sm tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
      />
    </label>
  );
}
