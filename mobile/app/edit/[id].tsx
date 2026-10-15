import { Body, Eyebrow, Field, PrimaryButton, Screen, TextLink, Title } from "@/components/ui";
import { api } from "@/lib/api";
import { takeMeetingPin } from "@/lib/createPin";
import type { Id } from "@/lib/ids";
import { formatPace, formatWhenInput, parsePace, type WhoCanJoin } from "@/lib/types";
import { useAction, useMutation, useQuery } from "convex/react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";

export default function EditRunScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const runId = params.id as Id<"runs">;
  const run = useQuery(api.runs.get, runId ? { runId } : "skip");
  const lookupPlace = useAction(api.geocode.lookup);
  const updateRun = useMutation(api.runs.update);
  const [placeName, setPlaceName] = useState("");
  const [when, setWhen] = useState("");
  const [distanceKm, setDistanceKm] = useState("8");
  const [spots, setSpots] = useState("8");
  const [paceMin, setPaceMin] = useState("5:30");
  const [paceMax, setPaceMax] = useState("6:00");
  const [whoCanJoin, setWhoCanJoin] = useState<WhoCanJoin>("open");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!run || loaded) {
      return;
    }
    setPlaceName(run.placeName);
    setWhen(formatWhenInput(run.startsAt));
    setDistanceKm(String(run.distanceKm));
    setSpots(String(run.spots));
    setPaceMin(formatPace(run.paceMin));
    setPaceMax(formatPace(run.paceMax));
    setWhoCanJoin(run.whoCanJoin);
    setPin({ lat: run.lat, lng: run.lng });
    setLoaded(true);
  }, [run, loaded]);

  useFocusEffect(
    useCallback(() => {
      const next = takeMeetingPin();
      if (!next) {
        return;
      }
      setPin({ lat: next.lat, lng: next.lng });
      setPlaceName((current) => (current.trim() ? current : next.label));
      setError("");
    }, []),
  );

  if (run === undefined) {
    return (
      <Screen>
        <Body>Loading this run…</Body>
      </Screen>
    );
  }

  if (run === null) {
    return (
      <Screen>
        <Body>This run is not on the board.</Body>
        <TextLink label="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!run.viewerIsHost) {
    return (
      <Screen>
        <Body>Only the host can edit this run.</Body>
        <TextLink label="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  async function onSubmit() {
    const min = parsePace(paceMin);
    const max = parsePace(paceMax);
    const startsAt = Date.parse(when.replace(" ", "T"));
    if (!placeName.trim() || Number.isNaN(startsAt) || !min || !max) {
      setError("Fill every field. When looks like 2026-09-10 21:00. Pace looks like 5:45.");
      return;
    }
    if (max < min) {
      setError("The slower end of the band must be higher than the faster end.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const coords = pin ?? (await lookupPlace({ placeName: placeName.trim(), city: "Barcelona" }));
      if (!coords) {
        setError("Could not find that meeting point. Pin it on the map, or try a park or plaza name.");
        setPending(false);
        return;
      }
      await updateRun({
        runId,
        startsAt,
        distanceKm: Number(distanceKm),
        paceMin: min,
        paceMax: max,
        spots: Number(spots),
        whoCanJoin,
        placeName: placeName.trim(),
        city: "Barcelona",
        lat: coords.lat,
        lng: coords.lng,
      });
      router.replace(`/run/${runId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the run.");
      setPending(false);
    }
  }

  return (
    <Screen>
      <Eyebrow>Public pin</Eyebrow>
      <Title>Edit run</Title>
      <Field
        label="Meeting point"
        value={placeName}
        onChangeText={setPlaceName}
        placeholder="Parc de la Ciutadella, Arc de Triomf"
      />
      <TextLink
        label={pin ? "Pinned · move the pin" : "Pin on map"}
        onPress={() =>
          router.push({
            pathname: "/create-map",
            params: { placeName: placeName.trim() },
          })
        }
      />
      <Field label="When" value={when} onChangeText={setWhen} placeholder="2026-09-10 21:00" />
      <Field label="Distance km" value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" />
      <Field label="Spots" value={spots} onChangeText={setSpots} keyboardType="numeric" />
      <Field label="Pace from" value={paceMin} onChangeText={setPaceMin} />
      <Field label="Pace to" value={paceMax} onChangeText={setPaceMax} />
      <Field
        label="Who (open, women, or men)"
        value={whoCanJoin}
        onChangeText={(value) => {
          if (value === "open" || value === "women" || value === "men") {
            setWhoCanJoin(value);
          }
        }}
        autoCapitalize="none"
      />
      {error ? <Text style={{ color: "#f5a9a9", marginTop: 12 }}>{error}</Text> : null}
      <PrimaryButton disabled={pending} label={pending ? "Saving…" : "Save changes"} onPress={() => void onSubmit()} />
      <TextLink label="Back" onPress={() => router.back()} />
    </Screen>
  );
}
