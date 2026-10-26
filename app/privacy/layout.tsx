import { baseOpenGraph } from "@/app/shared-metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacidad | TimesRun Club",
  description:
    "Qué datos guarda TimesRun Club, quién los ve y cómo borrar tu cuenta, explicado en lenguaje claro.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    ...baseOpenGraph,
    url: "https://www.timesrun.club/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
