import ChangelogFeed from "@/components/ChangelogFeed";
import Header from "@/components/Header";
import { entries } from "@/lib/entries";
import { tagOrder } from "@/lib/tagConfig";
import type { TagType } from "@/lib/types";

type PageProps = {
  searchParams?: {
    tags?: string | string[];
  };
};

function parseInitialFilters(tags: string | string[] | undefined): TagType[] {
  const rawTags = Array.isArray(tags) ? tags.join(",") : tags ?? "";
  const requestedTags = new Set(
    rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag): tag is TagType => tagOrder.includes(tag as TagType)),
  );

  return tagOrder.filter((tag) => requestedTags.has(tag));
}

export default async function Home({ searchParams }: PageProps) {
  const activeFilters = parseInitialFilters(searchParams?.tags);
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
        <ChangelogFeed entries={filteredEntries} />
      </main>

      <footer className="flex justify-center gap-2 px-6 py-12 font-mono text-[11px] leading-5 text-[#4A3C30]">
        <a href="#" className="transition-colors hover:text-[#7A6A5A]">
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
    </div>
  );
}
