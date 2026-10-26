import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacidad | TimesRun Club",
  description:
    "Qué datos guarda TimesRun Club, quién los ve y cómo borrar tu cuenta, explicado en lenguaje claro.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
