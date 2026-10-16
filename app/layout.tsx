import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import Script from "next/script";
import { PwaInstall } from "./components/pwa-install";
import { ConvexClientProvider } from "./ConvexClientProvider";
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
  metadataBase: new URL("https://timesrun.club"),
  title: "TimesRun Club",
  description: "Find people at your pace. Join clubs. Fill open runs.",
  applicationName: "TimesRun Club",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} ${ibmPlexMono.variable} antialiased`}>
        <Script id="canonical-www" strategy="beforeInteractive">
          {`if(location.hostname==="timesrun.club"){if(navigator.serviceWorker){navigator.serviceWorker.getRegistrations().then(function(registrations){registrations.forEach(function(registration){registration.unregister()})})}location.replace("https://www.timesrun.club"+location.pathname+location.search+location.hash)}`}
        </Script>
        <ConvexClientProvider>
          {children}
          <PwaInstall />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
