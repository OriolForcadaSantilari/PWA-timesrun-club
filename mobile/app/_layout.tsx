import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import {
  InterTight_700Bold,
  InterTight_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter-tight";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    InterTight_700Bold,
    InterTight_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ConvexClientProvider>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#000000" },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="run/[id]" />
          <Stack.Screen name="edit/[id]" />
          <Stack.Screen name="create" />
          <Stack.Screen name="create-map" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </ConvexClientProvider>
  );
}
