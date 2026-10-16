"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export function AuthButtons() {
  const { signOut } = useAuthActions();

  return (
    <>
      <AuthLoading>
        <span className="text-[11px] tracking-[0.18em] uppercase opacity-50">…</span>
      </AuthLoading>
      <Unauthenticated>
        <a href="/sign-in" className="text-[11px] tracking-[0.18em] uppercase">
          Sign in
        </a>
      </Unauthenticated>
      <Authenticated>
        <button
          type="button"
          className="text-[11px] tracking-[0.18em] uppercase"
          onClick={() => {
            void signOut().then(() => {
              window.location.assign("/find");
            });
          }}
        >
          Sign out
        </button>
      </Authenticated>
    </>
  );
}
