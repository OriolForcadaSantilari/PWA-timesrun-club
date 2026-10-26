import { baseOpenGraph } from "@/app/shared-metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Encuentra runs en grupo en Barcelona | TimesRun Club",
  description:
    "Runs abiertos esta semana en Barcelona: hora, distancia, ritmo y plazas libres. Filtra por ritmo y únete en un punto público.",
  alternates: {
    canonical: "/find",
  },
  openGraph: {
    ...baseOpenGraph,
    url: "https://www.timesrun.club/find",
  },
};

export default function FindLayout({ children }: { children: ReactNode }) {
  return children;
}
