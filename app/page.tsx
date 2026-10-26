import { Landing } from "@/app/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TimesRun Club · Grupos para correr en Barcelona",
  description:
    "Encuentra gente que corre a tu ritmo en Barcelona. Únete a runs abiertos en puntos públicos o descubre los clubs de running de la ciudad.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <Landing />;
}
