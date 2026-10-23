"use client";

import { useT } from "./i18n-provider";

export function LanguageSwitch() {
  const { locale, t, setLocale } = useT();

  return (
    <div className="pointer-events-none fixed right-4 bottom-16 z-40 md:right-8">
      <div className="pointer-events-auto flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[12px] tracking-[0.18em] uppercase">
        <button
          type="button"
          onClick={() => setLocale("es")}
          aria-label={t("langEs")}
          aria-pressed={locale === "es"}
          className={locale === "es" ? "text-[#f4efe6]" : "text-white/40 hover:text-white/70"}
        >
          ESP
        </button>
        <span className="text-white/25" aria-hidden>
          /
        </span>
        <button
          type="button"
          onClick={() => setLocale("en")}
          aria-label={t("langEn")}
          aria-pressed={locale === "en"}
          className={locale === "en" ? "text-[#f4efe6]" : "text-white/40 hover:text-white/70"}
        >
          ENG
        </button>
      </div>
    </div>
  );
}
