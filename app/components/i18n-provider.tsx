"use client";

import {
  localeFromLanguageTag,
  PREVIEW_LANG_KEY,
  translate,
  type Locale,
  type MessageKey,
  type MessageVars,
} from "@/lib/i18n";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type TFunction = (key: MessageKey, vars?: MessageVars) => string;

type I18nValue = {
  locale: Locale;
  t: TFunction;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function readQueryLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }
  const query = new URLSearchParams(window.location.search).get("lang");
  return query === "es" || query === "en" ? query : null;
}

function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(PREVIEW_LANG_KEY);
    return stored === "es" || stored === "en" ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredLocale(locale: Locale) {
  try {
    window.localStorage.setItem(PREVIEW_LANG_KEY, locale);
  } catch {
    // Private mode: the click still updates this tab via emit().
  }
  document.cookie = `timesrun-lang=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function getClientLocale(initialLocale: Locale): Locale {
  return (
    readQueryLocale() ??
    readStoredLocale() ??
    localeFromLanguageTag(navigator.language) ??
    initialLocale
  );
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

function setLocale(next: Locale) {
  writeStoredLocale(next);
  const url = new URL(window.location.href);
  if (url.searchParams.has("lang")) {
    url.searchParams.delete("lang");
    const search = url.searchParams.toString();
    window.history.replaceState({}, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
  }
  emit();
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    () => getClientLocale(initialLocale),
    () => initialLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    const fromQuery = readQueryLocale();
    if (fromQuery) {
      writeStoredLocale(fromQuery);
    }
  }, [locale]);

  const t = useCallback<TFunction>(
    (key, vars) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useT must be used inside I18nProvider");
  }
  return value;
}
