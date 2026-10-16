"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const AUTH_WAIT_MS = 5000;

export function RequireSignIn({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const timeoutId = window.setTimeout(() => setTimedOut(true), AUTH_WAIT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
    if (!isLoading || timedOut) {
      const next = window.location.pathname + window.location.search;
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, isLoading, timedOut, router]);

  if (isAuthenticated) {
    return children;
  }

  return (
    <p className="min-h-svh bg-black px-8 py-20 text-sm text-white/60">
      {isLoading && !timedOut ? "Loading…" : "Redirecting to sign in…"}
    </p>
  );
}
