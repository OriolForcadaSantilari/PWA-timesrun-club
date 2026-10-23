"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useT } from "./i18n-provider";

export function AuthButtons() {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const { t } = useT();

  if (isAuthenticated) {
    return (
      <button
        type="button"
        className="text-[11px] tracking-[0.18em] uppercase"
        onClick={() => {
          void signOut().then(() => {
            window.location.assign("/find");
          });
        }}
      >
        {t("signOut")}
      </button>
    );
  }

  return (
    <a
      href="/sign-in"
      className="text-[11px] tracking-[0.18em] uppercase"
    >
      {t("signIn")}
    </a>
  );
}
