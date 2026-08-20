import type { Metadata } from "next";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import Studio from "@/components/studio/Studio";
import { entries } from "@/lib/entries";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Turn a git log, a list of commits, or plain notes into publishable release notes — in four voices and seven formats, entirely in the browser.",
};

export default function StudioPage() {
  return (
    <div id="top">
      <Header />
      <main>
        <Studio
          today={new Date().toISOString().slice(0, 10)}
          latestVersion={entries[0].version}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
