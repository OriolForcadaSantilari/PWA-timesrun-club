"use client";

import { useT } from "./i18n-provider";
import Link from "next/link";

export function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="border-t border-white/15 px-5 py-3 md:px-8">
      <Link
        href="/privacy"
        className="block text-center text-[11px] tracking-[0.18em] uppercase text-white/55 underline"
      >
        {t("privacy")}
      </Link>
    </footer>
  );
}
