"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function RequireSignIn({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = window.location.pathname + window.location.search;
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <p className="min-h-svh bg-black px-8 py-20 text-sm text-white/60">
        {isLoading ? "Loading…" : "Redirecting to sign in…"}
      </p>
    );
  }

  return children;
}
