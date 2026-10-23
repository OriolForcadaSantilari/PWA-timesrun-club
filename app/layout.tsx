import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import { I18nProvider } from "./components/i18n-provider";
import { PwaInstall } from "./components/pwa-install";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { localeFromAcceptLanguage, type Locale } from "@/lib/i18n";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.timesrun.club"),
  title: "TimesRun Club",
  description: "Find people at your pace. Join clubs. Fill open runs.",
  applicationName: "TimesRun Club",
  openGraph: {
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
  },
  twitter: {
    card: "summary_large_image",
    title: "TimesRun Club",
    description: "Find people at your pace. Join clubs. Fill open runs.",
    images: ["https://www.timesrun.club/og.jpg?v=1"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "TimesRun Club",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerList = await headers();
  const cookieLocale = cookieStore.get("timesrun-lang")?.value;
  const initialLocale: Locale =
    cookieLocale === "es" || cookieLocale === "en"
      ? cookieLocale
      : localeFromAcceptLanguage(headerList.get("accept-language"));

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body className={`${interTight.variable} ${ibmPlexMono.variable} antialiased`}>
        <Script id="canonical-www" strategy="beforeInteractive">
          {`if(location.hostname==="timesrun.club"){if(navigator.serviceWorker){navigator.serviceWorker.getRegistrations().then(function(registrations){registrations.forEach(function(registration){registration.unregister()})})}location.replace("https://www.timesrun.club"+location.pathname+location.search+location.hash)}`}
        </Script>
        <ConvexClientProvider>
          <I18nProvider initialLocale={initialLocale}>
            {children}
            <PwaInstall />
          </I18nProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
