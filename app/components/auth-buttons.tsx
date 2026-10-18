"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function AuthButtons() {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  if (isAuthenticated) {
    return (
      <button
        type="button"
        className="text-[11px] tracking-[0.18em] uppercase underline underline-offset-4"
        onClick={() => {
          void signOut().then(() => {
            window.location.assign("/find");
          });
        }}
      >
        Sign out
      </button>
    );
  }

  return (
    <a
      href="/sign-in"
      className="text-[11px] tracking-[0.18em] uppercase underline underline-offset-4"
    >
      Sign in
    </a>
  );
}
