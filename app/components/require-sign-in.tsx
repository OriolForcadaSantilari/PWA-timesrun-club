"use client";

import { useConvexAuth } from "convex/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AnnouncementBar, SiteHeader } from "./site-header";

const AUTH_WAIT_MS = 4000;

function clearConvexAuthKeys() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("__convexAuth")) {
      localStorage.removeItem(key);
    }
  }
}

export function RequireSignIn({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const signInHref = `/sign-in?next=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
    if (!isLoading) {
      window.location.replace(signInHref);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      clearConvexAuthKeys();
      window.location.replace(signInHref);
    }, AUTH_WAIT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, isLoading, signInHref]);

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <SiteHeader />
      <div className="px-8 py-20">
        <p className="text-sm text-white/60">
          {isLoading ? "Checking your session…" : "Redirecting to sign in…"}
        </p>
        <a
          href={signInHref}
          onClick={clearConvexAuthKeys}
          className="mt-6 inline-flex h-11 items-center text-[11px] tracking-[0.28em] uppercase underline"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
