"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "timesrun-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notChrome = !/CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && notChrome;
}

export function PwaInstall() {
  const [showIosHint, setShowIosHint] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          void registration.update();
        }
      });
      void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
    }

    if (isStandaloneDisplay() || window.localStorage.getItem(DISMISS_KEY) === "1") {
      return;
    }

    if (isIosSafari()) {
      setShowIosHint(true);
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setShowIosHint(false);
    setInstallEvent(null);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      dismiss();
      return;
    }
    setInstallEvent(null);
  }

  if (!showIosHint && !installEvent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black px-4 py-3 text-[#f4efe6]">
      <div className="mx-auto flex max-w-lg items-start justify-between gap-3">
        <p className="text-[11px] leading-relaxed tracking-[0.04em]">
          {installEvent ? (
            <>Add TimesRun Club to your home screen — opens on Find, like an app.</>
          ) : (
            <>
              On iPhone: tap Share
              <span aria-hidden> ⎋ </span>
              then <span className="uppercase tracking-[0.14em]">Add to Home Screen</span>.
            </>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {installEvent ? (
            <button
              type="button"
              onClick={() => void install()}
              className="border border-[#d8b878] px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] text-[#d8b878] uppercase"
            >
              Install
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install hint"
            className="px-2 py-1.5 text-[10px] tracking-[0.16em] text-white/50 uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
