import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Clubs de running en Barcelona | TimesRun Club",
  description:
    "Los clubs de running de Barcelona día a día: hora, punto de encuentro e Instagram de cada uno.",
  alternates: {
    canonical: "/clubs",
  },
};

export default function ClubsLayout({ children }: { children: ReactNode }) {
  return children;
}
