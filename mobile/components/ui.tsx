import { HeroBanner, PlainHeader, type HeroId } from "@/components/brand";
import { black, cream, display, line, muted } from "@/lib/theme";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

export function Screen({
  children,
  hero,
}: {
  children: React.ReactNode;
  hero?: { source: HeroId; kicker: string; title: string };
}) {
  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.scrollContent}
      >
        {hero ? (
          <HeroBanner hero={hero.source} kicker={hero.kicker} title={hero.title} />
        ) : (
          <PlainHeader />
        )}
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Eyebrow({ children }: { children: string }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Title({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.eyebrow}>{label}</Text>
      <TextInput placeholderTextColor={muted} style={styles.input} {...props} />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {({ pressed }) => (
        <Text style={[styles.buttonLabel, pressed ? styles.buttonLabelPressed : null]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: black,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 120,
  },
  eyebrow: {
    color: cream,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  title: {
    color: cream,
    fontFamily: display,
    fontSize: 40,
    letterSpacing: -1.2,
    marginTop: 8,
  },
  body: {
    color: muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  field: {
    gap: 8,
    marginTop: 20,
  },
  input: {
    borderColor: line,
    borderWidth: 1,
    color: cream,
    fontSize: 16,
    height: 44,
    paddingHorizontal: 12,
  },
  button: {
    alignItems: "center",
    borderColor: cream,
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    marginTop: 24,
  },
  buttonPressed: {
    backgroundColor: cream,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonLabel: {
    color: cream,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  buttonLabelPressed: {
    color: black,
  },
  link: {
    color: muted,
    fontSize: 11,
    letterSpacing: 1.8,
    marginTop: 20,
    textDecorationLine: "underline",
    textTransform: "uppercase",
  },
});
