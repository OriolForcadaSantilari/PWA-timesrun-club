import { Body, PrimaryButton, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { canJoinRun, spotsLeft } from "@/lib/matching";
import { cream, displayBold, line, muted } from "@/lib/theme";
import { formatPace, formatWhen, whoLabel, type WhoCanJoin } from "@/lib/types";
import { useQuery } from "convex/react";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const FILTERS: { id: "match" | WhoCanJoin | "all"; label: string }[] = [
  { id: "match", label: "For you" },
  { id: "all", label: "All" },
  { id: "open", label: "Open to all" },
  { id: "women", label: "Women only" },
  { id: "men", label: "Men only" },
];

export default function FindScreen() {
  const router = useRouter();
  const me = useQuery(api.users.me);
  const [now] = useState(() => Date.now());
  const runs = useQuery(api.runs.list, { city: "Barcelona", now });
  const [who, setWho] = useState<(typeof FILTERS)[number]["id"]>("match");

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

  return (
    <Screen hero={{ source: 1, kicker: "Barcelona", title: "Find" }}>
      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.id}
            onPress={() => setWho(filter.id)}
            style={[styles.chip, who === filter.id ? styles.chipOn : null]}
          >
            <Text style={[styles.chipLabel, who === filter.id ? styles.chipLabelOn : null]}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <PrimaryButton label="Create a run" onPress={() => router.push("/create")} />

      <Text style={styles.hint}>
        {me
          ? `Easy pace ${formatPace(me.easyPaceMinPerKm)} /km${
              me.gender === "unspecified" ? " · set gender in You to join women/men only" : ""
            }`
          : "Sign in to match your pace and join"}
      </Text>

      {runs === undefined ? (
        <Body>Loading the board…</Body>
      ) : (
        visible.map((run) => {
          const left = spotsLeft(run.spots, run.joinedCount);
          return (
            <Link key={run._id} href={`/run/${run._id}`} asChild>
              <Pressable style={styles.row}>
                <View style={styles.rowTop}>
                  <Text style={styles.meta}>{formatWhen(run.startsAt)}</Text>
                  <Text style={styles.meta}>
                    {run.distanceKm} km · {formatPace(run.paceMin)}–{formatPace(run.paceMax)}
                  </Text>
                </View>
                <Text style={styles.place}>{run.placeName}</Text>
                <View style={styles.rowBottom}>
                  <Text style={styles.meta}>
                    {whoLabel(run.whoCanJoin)} · {left} {left === 1 ? "spot" : "spots"} left
                  </Text>
                  <Text style={styles.join}>{run.viewerJoined ? "Going" : "Join"}</Text>
                </View>
              </Pressable>
            </Link>
          );
        })
      )}

      {runs !== undefined && visible.length === 0 ? (
        <Body>No matching runs this week. Create one at a public pin, or open All.</Body>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderColor: "rgba(244,239,230,0.25)",
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  chipOn: {
    backgroundColor: cream,
    borderColor: cream,
  },
  chipLabel: {
    color: cream,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  chipLabelOn: {
    color: "#000000",
  },
  hint: {
    color: muted,
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 20,
    textTransform: "uppercase",
  },
  row: {
    borderTopColor: line,
    borderTopWidth: 1,
    paddingVertical: 20,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  meta: {
    color: muted,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  join: {
    color: cream,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  place: {
    color: cream,
    fontFamily: displayBold,
    fontSize: 22,
    letterSpacing: -0.6,
    marginVertical: 8,
  },
});
