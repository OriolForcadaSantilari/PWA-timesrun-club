"use client";

import { useConvexAuth } from "convex/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AnnouncementBar, SiteHeader } from "./site-header";

export function RequireSignIn({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const signInHref = `/sign-in?next=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    if (isAuthenticated || isLoading) {
      return;
    }
    window.location.replace(signInHref);
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
          className="mt-6 inline-flex h-11 items-center text-[11px] tracking-[0.28em] uppercase underline"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
