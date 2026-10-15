import { Body, Eyebrow, Field, PrimaryButton, Screen, TextLink, Title } from "@/components/ui";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

type Mode = "signIn" | "signUp" | "forgot" | "resetCode";

export default function SignInScreen() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/you");
    }
  }, [isAuthenticated, router]);

  async function onSubmit() {
    setError("");
    setPending(true);
    try {
      if (mode === "forgot") {
        await signIn("password", { email, flow: "reset" });
        setResetEmail(email);
        setMode("resetCode");
        return;
      }
      if (mode === "resetCode") {
        await signIn("password", {
          email: resetEmail,
          code,
          newPassword,
          flow: "reset-verification",
        });
        router.replace("/(tabs)/you");
        return;
      }
      await signIn("password", {
        email,
        password,
        name,
        flow: mode,
      });
      router.replace("/(tabs)");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      if (mode === "forgot" && message.includes("InvalidAccountId")) {
        setResetEmail(email);
        setMode("resetCode");
        return;
      }
      setError(message || "Could not sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <Eyebrow>Account</Eyebrow>
      <Title>
        {mode === "signUp"
          ? "Create account"
          : mode === "forgot"
            ? "Forgot password"
            : mode === "resetCode"
              ? "Set a new password"
              : "Sign in"}
      </Title>
      <Body>
        {mode === "forgot"
          ? "We’ll email an 8-digit code if this address has an account."
          : mode === "resetCode"
            ? `Enter the code sent to ${resetEmail}.`
            : "Same board as the website. Sign in to join or create a run."}
      </Body>
      {mode === "signUp" ? (
        <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      ) : null}
      {mode === "signIn" || mode === "signUp" || mode === "forgot" ? (
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      ) : null}
      {mode === "signIn" || mode === "signUp" ? (
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      ) : null}
      {mode === "resetCode" ? (
        <>
          <Field label="Code" value={code} onChangeText={setCode} keyboardType="number-pad" />
          <Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        </>
      ) : null}
      {error ? <Text style={{ color: "#f5a9a9", marginTop: 12 }}>{error}</Text> : null}
      <PrimaryButton
        disabled={pending}
        label={pending ? "Working…" : mode === "forgot" ? "Send code" : mode === "resetCode" ? "Update password" : mode === "signUp" ? "Create account" : "Sign in"}
        onPress={() => void onSubmit()}
      />
      {mode === "signIn" ? (
        <TextLink
          label="Forgot password?"
          onPress={() => {
            setError("");
            setMode("forgot");
          }}
        />
      ) : null}
      <TextLink
        label={mode === "signIn" ? "Need an account? Create one" : "Back to sign in"}
        onPress={() => {
          setError("");
          setMode(mode === "signIn" ? "signUp" : "signIn");
        }}
      />
    </Screen>
  );
}
