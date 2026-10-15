import { Body, PrimaryButton, Screen, TextLink } from "@/components/ui";
import type { Id } from "@/lib/ids";
import { api } from "@/lib/api";
import { canJoinRun, spotsLeft } from "@/lib/matching";
import { cream, muted } from "@/lib/theme";
import { formatPace, formatWhen, mapsSearchUrl, whoLabel } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Share, StyleSheet, Text, View } from "react-native";

export default function RunScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const runId = params.id as Id<"runs">;
  const me = useQuery(api.users.me);
  const run = useQuery(api.runs.get, runId ? { runId } : "skip");
  const joinRun = useMutation(api.runs.join);
  const leaveRun = useMutation(api.runs.leave);
  const cancelRun = useMutation(api.runs.cancel);
  const [error, setError] = useState("");
  const [shareNote, setShareNote] = useState("");

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
        <TextLink label="Back to Find" onPress={() => router.back()} />
      </Screen>
    );
  }

  const listed = run;
  const gate = canJoinRun(listed, listed.joinedCount, listed.viewerJoined, me ?? null);
  const left = spotsLeft(listed.spots, listed.joinedCount);
  const maps = mapsSearchUrl(listed.placeName, listed.city);
  const shareUrl = `https://timesrun.club/runs/${listed._id}`;

  async function onShare() {
    setShareNote("");
    try {
      await Share.share({
        title: `${listed.placeName} · TimesRun Club`,
        message: `${formatWhen(listed.startsAt)} · ${listed.distanceKm} km · ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      setShareNote("Could not share");
    }
  }

  return (
    <Screen hero={{ source: 1, kicker: listed.city, title: listed.placeName }}>
      <View style={styles.grid}>
        <Meta label="When" value={formatWhen(listed.startsAt)} />
        <Meta label="Distance" value={`${listed.distanceKm} km`} />
        <Meta label="Pace" value={`${formatPace(listed.paceMin)}–${formatPace(listed.paceMax)} /km`} />
        <Meta label="Who" value={whoLabel(listed.whoCanJoin)} />
      </View>
      <Body>
        {left} {left === 1 ? "spot" : "spots"} left · {listed.joinedCount} going. Meet at the public
        pin.
      </Body>
      <TextLink label="Open map" onPress={() => void Linking.openURL(maps)} />
      <TextLink label="Share" onPress={() => void onShare()} />
      {shareNote ? <Text style={styles.note}>{shareNote}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {listed.viewerIsHost ? (
        <>
          <Body>You're hosting this run.</Body>
          <PrimaryButton label="Edit run" onPress={() => router.push({ pathname: "/edit/[id]", params: { id: listed._id } })} />
          <TextLink
            label="Cancel run"
            onPress={() => {
              Alert.alert(
                "Cancel this run?",
                "It comes off the board. People who joined will no longer see it.",
                [
                  { text: "Keep it", style: "cancel" },
                  {
                    text: "Cancel run",
                    style: "destructive",
                    onPress: () => {
                      setError("");
                      void cancelRun({ runId: listed._id })
                        .then(() => router.replace("/(tabs)"))
                        .catch((caught: unknown) => {
                          setError(caught instanceof Error ? caught.message : "Could not cancel.");
                        });
                    },
                  },
                ],
              );
            }}
          />
        </>
      ) : listed.viewerJoined ? (
        <PrimaryButton
          label="Leave run"
          onPress={() => {
            setError("");
            void leaveRun({ runId: listed._id }).catch((caught: unknown) => {
              setError(caught instanceof Error ? caught.message : "Could not leave.");
            });
          }}
        />
      ) : gate.ok ? (
        <PrimaryButton
          label="Join"
          onPress={() => {
            setError("");
            void joinRun({ runId: listed._id }).catch((caught: unknown) => {
              setError(caught instanceof Error ? caught.message : "Could not join.");
            });
          }}
        />
      ) : !me ? (
        <PrimaryButton label="Sign in to join" onPress={() => router.push("/sign-in")} />
      ) : (
        <>
          <Body>{gate.reason ?? "You cannot join this run."}</Body>
          <TextLink label="Update your profile" onPress={() => router.push("/(tabs)/you")} />
        </>
      )}
      <TextLink label="Back to Find" onPress={() => router.back()} />
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  meta: {
    width: "50%",
    marginBottom: 16,
  },
  metaLabel: {
    color: muted,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  metaValue: {
    color: cream,
    fontSize: 15,
    marginTop: 6,
  },
  note: {
    color: muted,
    fontSize: 11,
    letterSpacing: 1.4,
    marginTop: 8,
    textTransform: "uppercase",
  },
  error: {
    color: "#f5a9a9",
    marginTop: 12,
  },
});
