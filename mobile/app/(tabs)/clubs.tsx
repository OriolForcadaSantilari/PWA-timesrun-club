import { Body, PrimaryButton, Screen } from "@/components/ui";
import { useRouter } from "expo-router";

export default function ClubsScreen() {
  const router = useRouter();

  return (
    <Screen hero={{ source: 3, kicker: "Barcelona", title: "Clubs" }}>
      <Body>
        Full organic clubs stay where they are. TimesRun Club is the overflow: open runs at public pins,
        then claimed club pages later. Until a club lists here, create or join a run.
      </Body>
      <PrimaryButton label="Find a run" onPress={() => router.push("/(tabs)")} />
    </Screen>
  );
}
