import { AnnouncementBar, BrandMark } from "@/components/brand";
import { Body, PrimaryButton, TextLink } from "@/components/ui";
import { api } from "@/lib/api";
import { barcelonaRegion, stashMeetingPin } from "@/lib/createPin";
import { black, muted } from "@/lib/theme";
import { useAction } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, type MapPressEvent } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Coord = { latitude: number; longitude: number };

export default function CreateMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ placeName?: string }>();
  const reversePlace = useAction(api.geocode.reverse);
  const existingName = params.placeName?.trim() ?? "";
  const [coord, setCoord] = useState<Coord | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function onMapPress(event: MapPressEvent) {
    setError("");
    setCoord(event.nativeEvent.coordinate);
  }

  async function onUsePin() {
    if (!coord) {
      setError("Tap the map to drop a pin first.");
      return;
    }
    setPending(true);
    setError("");
    try {
      let reversed: string | null = null;
      try {
        reversed = await reversePlace({ lat: coord.latitude, lng: coord.longitude });
      } catch {
        reversed = null;
      }
      stashMeetingPin({
        lat: coord.latitude,
        lng: coord.longitude,
        label: existingName || reversed || "Public pin, Barcelona",
      });
      router.back();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this pin.");
      setPending(false);
    }
  }

  return (
    <View style={styles.root}>
      <AnnouncementBar />
      <View style={styles.top}>
        <BrandMark />
        <Text style={styles.hint}>Tap the map to drop a pin. Drag it to the meeting point.</Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={barcelonaRegion}
        userInterfaceStyle="dark"
        onPress={onMapPress}
      >
        {coord ? (
          <Marker
            coordinate={coord}
            draggable
            onDragEnd={(event) => {
              setCoord(event.nativeEvent.coordinate);
            }}
          />
        ) : null}
      </MapView>
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Body>
          {coord
            ? existingName
              ? `${existingName} · pin dropped`
              : "Pin dropped. We’ll name it from the map if you left the meeting point blank."
            : "Public pin — a park, plaza, or beach, not a private address."}
        </Body>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          disabled={pending}
          label={pending ? "Saving pin…" : "Use this pin"}
          onPress={() => void onUsePin()}
        />
        <TextLink label="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: black,
  },
  top: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
  },
  hint: {
    color: muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  map: {
    flex: 1,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  error: {
    color: "#f5a9a9",
    marginTop: 12,
  },
});
