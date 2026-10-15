import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/15 px-5 py-6 md:px-8">
      <Link
        href="/privacy"
        className="text-[11px] tracking-[0.18em] uppercase text-white/55 underline"
      >
        Privacy
      </Link>
    </footer>
  );
}
