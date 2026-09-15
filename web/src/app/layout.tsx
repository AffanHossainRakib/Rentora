import type { Metadata, Viewport } from "next";
import { Fragment_Mono, Instrument_Sans } from "next/font/google";
import { SITE } from "@/shared/config/navigation";
import { RouteFocus } from "./_components/route-focus";
import { SkipLink } from "./_components/skip-link";
import "./globals.css";

/*
  Instrument Sans is the closest neo-grotesque on Google Fonts to Helvetica by
  measured cap-height, and it ships `tnum`, so numerals align without falling
  back to a mono. Fragment Mono is a monospaced Helvetica — the one literally
  Swiss monospace available — reserved for ids, counters and timestamps.
*/
const sans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

const mono = Fragment_Mono({
  variable: "--font-fragment",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Browse verified rental listings across Bangladesh, request a tenancy, and settle rent in one place.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored theme and arms reveal animations before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t)d.dataset.theme=t}catch(e){}d.dataset.motion="armed";setTimeout(function(){delete d.dataset.motion},2000)})()`,
          }}
        />
        <noscript>
          <style>{`[data-reveal]{visibility:visible!important;opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh">
        <SkipLink />
        <RouteFocus />
        {children}
      </body>
    </html>
  );
}
