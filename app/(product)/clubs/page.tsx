"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { useT } from "@/app/components/i18n-provider";
import { BARCELONA_CLUB_DAYS, instagramUrl, localWeekdayName } from "@/lib/barcelona-clubs";
import { weekdayLabel, weekdayShortLabel } from "@/lib/i18n";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";

function subscribeToNothing() {
  return () => {};
}

export default function ClubsPage() {
  const { locale, t } = useT();
  const today = useSyncExternalStore(subscribeToNothing, localWeekdayName, () => null);
  const [overrideDay, setOverrideDay] = useState<string | null>(null);
  const selectedDay = overrideDay ?? today;
  const selectedTabRef = useRef<HTMLButtonElement>(null);
  const moveFocusRef = useRef(false);

  useEffect(() => {
    const selectedTab = selectedTabRef.current;
    if (!selectedTab) {
      return;
    }
    selectedTab.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: "auto",
    });
    if (moveFocusRef.current) {
      selectedTab.focus();
      moveFocusRef.current = false;
    }
  }, [selectedDay]);

  function selectDay(day: string, moveFocus = false) {
    moveFocusRef.current = moveFocus;
    setOverrideDay(day);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = BARCELONA_CLUB_DAYS.length - 1;
    let next = index;
    if (event.key === "ArrowRight") {
      next = index === last ? 0 : index + 1;
    } else if (event.key === "ArrowLeft") {
      next = index === 0 ? last : index - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    } else {
      return;
    }
    event.preventDefault();
    selectDay(BARCELONA_CLUB_DAYS[next].day, true);
  }

  const section = BARCELONA_CLUB_DAYS.find((day) => day.day === selectedDay);

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <div className="relative h-[42vh] min-h-[280px] overflow-hidden">
        <img
          src="/heroes/timesrun-hero-3.png"
          alt={t("altGroup")}
          className="absolute inset-0 h-full w-full object-cover saturate-[0.82] contrast-[1.06] sepia-[0.18]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <SiteHeader overlay />
        <div className="absolute inset-x-0 bottom-8 px-5 md:px-8">
          <p className="text-[11px] tracking-[0.28em] uppercase">Barcelona</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em] md:text-7xl">
            {t("clubsTitle")}
          </h1>
        </div>
      </div>
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-5 py-12 md:px-8">
        <p className="text-sm leading-7 text-white/70">{t("clubsIntro")}</p>

        <div className="-mx-5 overflow-x-auto overscroll-x-contain px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:overflow-visible md:px-0">
          <div
            role="tablist"
            aria-label={t("clubsWeekdays")}
            className="flex w-max min-w-full gap-2 md:w-full md:justify-between"
          >
            {BARCELONA_CLUB_DAYS.map((day, index) => {
              const selected = day.day === selectedDay;
              return (
                <button
                  key={day.day}
                  ref={selected ? selectedTabRef : undefined}
                  type="button"
                  role="tab"
                  id={`club-tab-${day.day}`}
                  aria-selected={selected}
                  aria-controls="club-day-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectDay(day.day)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={`inline-flex h-11 min-w-[3.4rem] shrink-0 items-center justify-center rounded-full border px-4 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] uppercase md:min-w-0 md:flex-1 ${
                    selected
                      ? "border-[#f4efe6] bg-[#f4efe6] text-black"
                      : "border-white/25 text-[#f4efe6]"
                  }`}
                >
                  {weekdayShortLabel(locale, day.day)}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDay ? (
          <section
            id="club-day-panel"
            role="tabpanel"
            aria-labelledby={`club-tab-${selectedDay}`}
          >
            <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] uppercase">
              {weekdayLabel(locale, selectedDay)}
            </h2>
            {section && section.meetups.length > 0 ? (
              <ul className="mt-5 divide-y divide-white/15 border-t border-white/15">
                {section.meetups.map((meetup) => (
                  <li key={`${section.day}-${meetup.handle}-${meetup.time}`}>
                    <a
                      href={instagramUrl(meetup.handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-6 transition-opacity hover:opacity-80"
                    >
                      <p className="text-[11px] tracking-[0.18em] uppercase text-white/60">
                        {meetup.time} · {meetup.place}
                      </p>
                      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.03em]">
                        {meetup.name}
                      </p>
                      <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-white/60">
                        @{meetup.handle} · {t("instagram")}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 border-t border-white/15 pt-8 text-sm text-white/60">
                {t("clubsEmptyDay")}
              </p>
            )}
          </section>
        ) : null}

        <Link
          href="/find"
          className="inline-flex h-11 w-fit items-center rounded-full border border-white px-6 text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
        >
          {t("findARun")}
        </Link>
      </div>
    </div>
  );
}
