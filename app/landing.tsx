"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/heroes/timesrun-hero-1.png",
    title: "Open run",
    kicker: "FIND YOUR PACE",
    cta: "JOIN",
    alt: "Runner on a desert trail at golden hour",
  },
  {
    src: "/heroes/timesrun-hero-2.png",
    title: "Crew",
    kicker: "SATURDAY MORNING",
    cta: "FIND",
    alt: "Two runners on a dusty trail at sunset",
  },
  {
    src: "/heroes/timesrun-hero-3.png",
    title: "Clubs",
    kicker: "IN YOUR CITY",
    cta: "EXPLORE",
    alt: "A small running group starting together",
  },
  {
    src: "/heroes/timesrun-hero-4.png",
    title: "Away",
    kicker: "ANY CITY. YOUR PACE.",
    cta: "OPEN",
    alt: "A runner in the city at golden hour",
  },
] as const;

export function Landing() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />

      <section className="relative h-[calc(100svh-32px)] min-h-[560px] overflow-hidden">
        {SLIDES.map((item, i) => (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt}
            className={`absolute inset-0 h-full w-full object-cover object-[center_35%] saturate-[0.82] contrast-[1.06] sepia-[0.18] transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(20,12,6,0.35)_100%)]" />
        <div
          className="pointer-events-none absolute inset-[-20%] opacity-[0.22] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.9'/></svg>\")",
            animation: "grain 1.2s steps(2) infinite",
          }}
        />

        <SiteHeader overlay />

        {slide ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
            <h1 className="font-[family-name:var(--font-display)] text-[52px] leading-none font-extrabold tracking-[-0.04em] text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.25)] md:text-[88px]">
              {slide.title}
            </h1>
            <p className="mt-3 text-[11px] tracking-[0.28em] text-white uppercase">
              {slide.kicker}
            </p>
            <Link
              href="/find"
              className="mt-7 inline-flex h-10 items-center rounded-full border border-white px-8 text-[11px] tracking-[0.28em] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              {slide.cta}
            </Link>
          </div>
        ) : null}

        <div className="absolute right-5 bottom-6 z-20 md:right-8">
          <button
            type="button"
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => setPaused((value) => !value)}
            className="text-white"
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>

        <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {SLIDES.map((item, i) => (
            <button
              key={item.src}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-[2px] w-10 ${i === index ? "bg-white" : "bg-white/35"}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l12-7L8 5Z" />
    </svg>
  );
}
