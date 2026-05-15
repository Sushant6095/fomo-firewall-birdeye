import type { Metadata } from "next";
import "./globals.css";
import { SideNav } from "./_components/side-nav";
import { TopAppBar } from "./_components/top-app-bar";
import { Footer } from "./_components/footer";
import { GlobalShell } from "./_components/global-shell";

export const metadata: Metadata = {
  title: "FOMO Firewall — Intelligence Terminal",
  description:
    "Real-time Solana exit-liquidity intelligence. Obsidian Sentinel terminal powered by Birdeye Data.",
  applicationName: "FOMO Firewall",
  keywords: [
    "Solana",
    "TrapScore",
    "exit liquidity",
    "Birdeye",
    "risk intelligence"
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo-pulse.svg", type: "image/svg+xml", sizes: "any" }
    ],
    shortcut: "/favicon.svg",
    apple: "/logo-pulse.svg"
  },
  openGraph: {
    title: "FOMO Firewall — Exit-Liquidity Intelligence Terminal",
    description:
      "TrapScore: real-time Solana exit-liquidity detection powered by Birdeye Data.",
    images: ["/logo-pulse.svg"]
  }
};

// Apple devices use the native SF Pro / SF Mono stack from tailwind.config.ts.
// For everyone else we fall back to Inter (matches SF Pro's optical metrics)
// and Roboto Mono (matches SF Mono). Both via Google Fonts.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto+Mono:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body className="grid-pattern flex min-h-screen bg-background font-sans text-on-background antialiased selection:bg-primary/30 selection:text-primary">
        <GlobalShell>
          <SideNav />
          <div className="flex min-w-0 flex-1 flex-col md:pl-24">
            <TopAppBar />
            {children}
            <Footer />
          </div>
        </GlobalShell>
      </body>
    </html>
  );
}
