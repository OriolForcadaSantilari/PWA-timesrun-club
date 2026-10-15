import { SiteFooter } from "@/app/components/site-footer";
import type { ReactNode } from "react";

export default function ProductLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
