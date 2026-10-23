"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { type ReactNode, useEffect } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const AUTH_HANG_MS = 4000;
const AUTH_CLEARED_KEY = "timesrun-auth-cleared";

function AuthHangRecovery() {
  const { isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading) {
      sessionStorage.removeItem(AUTH_CLEARED_KEY);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (sessionStorage.getItem(AUTH_CLEARED_KEY) === "1") {
        return;
      }
      const authKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("__convexAuth"),
      );
      if (authKeys.length === 0) {
        return;
      }
      for (const key of authKeys) {
        localStorage.removeItem(key);
      }
      sessionStorage.setItem(AUTH_CLEARED_KEY, "1");
      window.location.reload();
    }, AUTH_HANG_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isLoading]);

  return null;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      <AuthHangRecovery />
      {children}
    </ConvexAuthProvider>
  );
}
