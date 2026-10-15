import { black, cream, display } from "@/lib/theme";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const heroes = {
  1: require("../assets/heroes/timesrun-hero-1.png"),
  2: require("../assets/heroes/timesrun-hero-2.png"),
  3: require("../assets/heroes/timesrun-hero-3.png"),
  4: require("../assets/heroes/timesrun-hero-4.png"),
} as const;

export type HeroId = keyof typeof heroes;

export function AnnouncementBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.announcement, { paddingTop: insets.top + 6 }]}>
      <Text style={styles.announcementText}>
        Open runs at your pace. Meet at a public pin.
      </Text>
    </View>
  );
}

export function BrandMark() {
  return (
    <View accessibilityRole="header" accessibilityLabel="TimesRun Club">
      <Text style={styles.brand}>TimesRun</Text>
      <Text style={styles.brandClub}>Club</Text>
    </View>
  );
}

export function HeroBanner({
  hero,
  kicker,
  title,
}: {
  hero: HeroId;
  kicker: string;
  title: string;
}) {
  return (
    <View>
      <AnnouncementBar />
      <View style={styles.hero}>
        <Image source={heroes[hero]} style={styles.photo} resizeMode="cover" />
        <View style={styles.scrim} />
        <View style={styles.heroTop}>
          <BrandMark />
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function PlainHeader() {
  return (
    <View>
      <AnnouncementBar />
      <View style={styles.plainBar}>
        <BrandMark />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  announcement: {
    backgroundColor: black,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  announcementText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 2.2,
    textAlign: "center",
    textTransform: "uppercase",
  },
  brand: {
    color: cream,
    fontFamily: display,
    fontSize: 22,
    letterSpacing: -0.8,
    lineHeight: 22,
    textTransform: "uppercase",
  },
  brandClub: {
    color: cream,
    fontFamily: display,
    fontSize: 10,
    letterSpacing: 4.6,
    lineHeight: 12,
    marginTop: 2,
    textTransform: "uppercase",
  },
  hero: {
    height: 280,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  photo: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  scrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  heroTop: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroBottom: {
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  kicker: {
    color: cream,
    fontSize: 11,
    letterSpacing: 2.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: cream,
    fontFamily: display,
    fontSize: 40,
    letterSpacing: -1.6,
    marginTop: 4,
  },
  plainBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
