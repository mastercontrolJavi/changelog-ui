import { Suspense } from "react";
import ChangelogFeed from "@/components/ChangelogFeed";
import Header from "@/components/Header";
import SubscribeToast from "@/components/SubscribeToast";
import AboutBadge from "@/components/AboutBadge";
import { entries } from "@/lib/entries";
import { parseFiltersFromParam } from "@/lib/tagConfig";

type PageProps = {
  searchParams?: {
    tags?: string | string[];
  };
};

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="h-3 w-16 rounded bg-[#2A2420]" />
          <div className="h-5 w-3/4 rounded bg-[#2A2420]" />
          <div className="h-3 w-24 rounded bg-[#2A2420]" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-[#1E1916]" />
            <div className="h-3 w-5/6 rounded bg-[#1E1916]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home({ searchParams }: PageProps) {
  const rawTags = searchParams?.tags;
  const tagsParam = Array.isArray(rawTags) ? rawTags.join(",") : rawTags ?? null;
  const activeFilters = parseFiltersFromParam(tagsParam);
  const filteredEntries =
    activeFilters.length === 0
      ? entries
      : entries.filter((entry) =>
          entry.tags.some((tag) => activeFilters.includes(tag)),
        );

  return (
    <div id="top" className="min-h-screen bg-[#0C0A08]">
      <Header initialFilters={activeFilters} />

      <main className="mx-auto max-w-[720px] px-6 pb-4 pt-14 sm:pt-16">
        <Suspense fallback={<FeedSkeleton />}>
          <ChangelogFeed entries={filteredEntries} />
        </Suspense>
      </main>

      <footer className="flex justify-center gap-2 px-6 py-12 font-mono text-[11px] leading-5 text-[#4A3C30]">
        <a href="/rss" className="transition-colors hover:text-[#7A6A5A]">
          Subscribe to RSS
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://javiertpadilla.com"
          className="transition-colors hover:text-[#7A6A5A]"
        >
          javiertpadilla.com
        </a>
      </footer>
      <SubscribeToast />
      <AboutBadge />
    </div>
  );
}
