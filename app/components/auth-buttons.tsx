"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthButtons() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <>
      <AuthLoading>
        <span className="text-[11px] tracking-[0.18em] uppercase opacity-50">…</span>
      </AuthLoading>
      <Unauthenticated>
        <Link href="/sign-in" className="text-[11px] tracking-[0.18em] uppercase">
          Sign in
        </Link>
      </Unauthenticated>
      <Authenticated>
        <button
          type="button"
          className="text-[11px] tracking-[0.18em] uppercase"
          onClick={() => {
            void signOut().then(() => router.refresh());
          }}
        >
          Sign out
        </button>
      </Authenticated>
    </>
  );
}
