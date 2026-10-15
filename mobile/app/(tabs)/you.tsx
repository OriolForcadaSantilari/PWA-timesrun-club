import { Body, Field, PrimaryButton, Screen, TextLink } from "@/components/ui";
import { api } from "@/lib/api";
import { formatPace, parsePace, type Gender } from "@/lib/types";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

const youHero = { source: 4 as const, kicker: "Stats live here later", title: "You" };

export default function YouScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const profile = useQuery(api.users.me);
  const saveProfile = useMutation(api.users.updateMe);
  const [name, setName] = useState<string | null>(null);
  const [pace, setPace] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (isLoading) {
    return (
      <Screen hero={youHero}>
        <Body>Loading…</Body>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen hero={youHero}>
        <Body>Sign in to set your pace and join runs.</Body>
        <PrimaryButton label="Sign in" onPress={() => router.push("/sign-in")} />
      </Screen>
    );
  }

  if (profile === undefined || profile === null) {
    return (
      <Screen hero={youHero}>
        <Body>Loading your profile…</Body>
      </Screen>
    );
  }

  const nameValue = name ?? profile.name;
  const paceValue = pace ?? formatPace(profile.easyPaceMinPerKm);
  const genderValue = gender ?? profile.gender;

  async function onSave() {
    const parsed = parsePace(paceValue);
    if (!nameValue.trim() || !parsed) {
      setError("Name and pace like 5:45 are required.");
      setSaved(false);
      return;
    }
    try {
      await saveProfile({ name: nameValue.trim(), easyPaceMinPerKm: parsed, gender: genderValue });
      setError("");
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
      setSaved(false);
    }
  }

  return (
    <Screen hero={youHero}>
      <Field label="Name" value={nameValue} onChangeText={setName} autoCapitalize="words" />
      <Field label="Easy pace /km" value={paceValue} onChangeText={setPace} placeholder="5:45" />
      <Field
        label="Gender (woman, man, or skip)"
        value={genderValue}
        onChangeText={(value) => {
          if (value === "woman" || value === "man" || value === "unspecified") {
            setGender(value);
          }
        }}
        placeholder="unspecified"
        autoCapitalize="none"
      />
      {error ? <Text style={{ color: "#f5a9a9", marginTop: 12 }}>{error}</Text> : null}
      {saved ? <Body>Saved. Find now uses this pace and gender rule.</Body> : null}
      <PrimaryButton label="Save" onPress={() => void onSave()} />
      <TextLink
        label="Sign out"
        onPress={() => {
          void signOut();
        }}
      />
    </Screen>
  );
}
