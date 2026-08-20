import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import AppProvider from "@/components/providers/AppProvider";
import "./globals.css";

/* Fraunces carries the editorial voice: optical sizing lets one family serve
   both a 116px masthead and a 22px entry title, and the WONK axis gives the
   serif enough character to feel set rather than defaulted. */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: false,
});

const plex = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE = "https://changelog.javiertpadilla.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Changelog Studio",
    template: "%s · Changelog Studio",
  },
  description:
    "An editorial changelog reader and a release-notes generator in one. Paste a git log, get publishable notes for engineering, product, and design.",
  applicationName: "Changelog Studio",
  authors: [{ name: "Javier Padilla", url: "https://javiertpadilla.com" }],
  keywords: [
    "changelog",
    "release notes",
    "conventional commits",
    "changelog generator",
    "developer tools",
    "design engineering",
  ],
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Changelog Studio",
    title: "Changelog Studio",
    description:
      "An editorial changelog reader and a release-notes generator in one.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog Studio",
    description:
      "An editorial changelog reader and a release-notes generator in one.",
  },
  alternates: {
    types: { "application/rss+xml": `${SITE}/rss` },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0908" },
    { media: "(prefers-color-scheme: light)", color: "#f8f4ea" },
  ],
};

/* Applied before first paint so a stored theme never flashes the default. */
const themeBootstrap = `(function(){try{var d=document.documentElement;
var t=localStorage.getItem("cl:theme");
if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}
d.setAttribute("data-theme",t);
d.setAttribute("data-density",localStorage.getItem("cl:density")||"comfortable");
}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-density="comfortable"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plex.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
