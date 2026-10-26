import type { Metadata } from "next";

export const baseOpenGraph = {
  title: "TimesRun Club",
  description: "Find people at your pace. Join clubs. Fill open runs.",
  url: "https://www.timesrun.club",
  siteName: "TimesRun Club",
  type: "website",
  locale: "en_US",
  images: [
    {
      url: "https://www.timesrun.club/og.jpg?v=1",
      width: 1200,
      height: 630,
      alt: "TimesRun Club",
      type: "image/jpeg",
    },
  ],
} satisfies NonNullable<Metadata["openGraph"]>;
