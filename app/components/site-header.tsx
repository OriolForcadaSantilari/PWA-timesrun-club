import { AuthButtons } from "./auth-buttons";

const NAV = [
  { href: "/find", label: "FIND" },
  { href: "/find/new", label: "CREATE" },
  { href: "/clubs", label: "CLUBS" },
] as const;

type SiteHeaderProps = {
  overlay?: boolean;
};

export function SiteHeader({ overlay = false }: SiteHeaderProps) {
  const tone = overlay ? "text-white" : "text-[#f4efe6]";

  return (
    <header
      className={`flex items-center justify-between px-5 py-4 md:px-8 ${
        overlay ? `absolute inset-x-0 top-0 z-20 ${tone}` : `relative bg-black ${tone}`
      }`}
    >
      <a
        href="/"
        aria-label="TimesRun Club"
        className="font-[family-name:var(--font-display)] leading-[0.88] font-extrabold uppercase drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]"
      >
        <span className="block text-[22px] tracking-[-0.04em] md:text-[26px]">TimesRun</span>
        <span className="mt-0.5 block text-[10px] tracking-[0.46em] md:text-[11px]">Club</span>
      </a>

      <nav className="flex items-center gap-3 md:gap-7">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-[10px] tracking-[0.16em] uppercase drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] md:text-[11px] md:tracking-[0.18em]"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <AuthButtons />
        <a href="/you" aria-label="Your profile">
          <PersonIcon />
        </a>
      </div>
    </header>
  );
}

export function AnnouncementBar() {
  return (
    <p className="bg-black px-4 py-1.5 text-center text-[10px] font-medium tracking-[0.22em] text-white uppercase">
      Open runs at your pace. Meet at a public pin.
    </p>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19c.8-3.2 3.2-5 6.5-5s5.7 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

