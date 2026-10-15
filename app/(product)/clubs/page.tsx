import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { BARCELONA_CLUB_DAYS, instagramUrl } from "@/lib/barcelona-clubs";
import Link from "next/link";

export default function ClubsPage() {
  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <div className="relative h-[42vh] min-h-[280px] overflow-hidden">
        <img
          src="/heroes/timesrun-hero-3.png"
          alt="A small running group starting together"
          className="absolute inset-0 h-full w-full object-cover saturate-[0.82] contrast-[1.06] sepia-[0.18]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <SiteHeader overlay />
        <div className="absolute inset-x-0 bottom-8 px-5 md:px-8">
          <p className="text-[11px] tracking-[0.28em] uppercase">Barcelona</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em] md:text-7xl">
            Clubs
          </h1>
        </div>
      </div>
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-5 py-12 md:px-8">
        <p className="text-sm leading-7 text-white/70">
          These crews already have a home. Tap a club for their Instagram. TimesRun is the overflow: open runs at public
          pins when you want a mixed group.
        </p>

        {BARCELONA_CLUB_DAYS.map((section) => (
          <section key={section.day}>
            <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.04em]">
              {section.day}
            </h2>
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
                      @{meetup.handle} · Instagram
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <Link
          href="/find"
          className="inline-flex h-11 w-fit items-center rounded-full border border-white px-6 text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
        >
          Find a run
        </Link>
      </div>
    </div>
  );
}
