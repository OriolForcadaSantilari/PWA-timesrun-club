import { baseOpenGraph } from "@/app/shared-metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Crear run | TimesRun Club",
  description: "Abre un run en un punto público de Barcelona: hora, distancia, ritmo y plazas.",
  alternates: {
    canonical: "/find/new",
  },
  openGraph: {
    ...baseOpenGraph,
    url: "https://www.timesrun.club/find/new",
  },
};

export default function CreateRunLayout({ children }: { children: ReactNode }) {
  return children;
}
