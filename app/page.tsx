import ChangelogFeed, { type FeedItem } from "@/components/ChangelogFeed";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MdxBody from "@/components/MdxBody";
import SiteFooter from "@/components/SiteFooter";
import { entries } from "@/lib/entries";
import { computeStats, monthlyActivity, relativeDays } from "@/lib/format";
import { parseFiltersFromParam } from "@/lib/tagConfig";

type PageProps = {
  searchParams?: { tags?: string | string[] };
};

export default function Home({ searchParams }: PageProps) {
  const rawTags = searchParams?.tags;
  const tagsParam = Array.isArray(rawTags) ? rawTags.join(",") : rawTags ?? null;
  const activeFilters = parseFiltersFromParam(tagsParam);

  // One "now" for the whole render, so every relative date agrees.
  const now = new Date();
  const stats = computeStats(entries);
  const activity = monthlyActivity(entries, 12, now);

  /* MDX is compiled here, on the server. The feed is a client component for
     the filtering and keyboard work, and receives the finished prose as a
     slot - so next-mdx-remote never reaches the browser bundle. */
  const items: FeedItem[] = entries.map((entry) => ({
    entry,
    relative: relativeDays(entry.date, now),
    body: <MdxBody source={entry.content} />,
  }));

  return (
    <div id="top">
      <Header />

      <Hero
        stats={stats}
        latestId={entries[0].id}
        activity={activity}
        now={now}
      />

      <main className="pb-6">
        <ChangelogFeed items={items} initialFilters={activeFilters} />
      </main>

      <SiteFooter />
    </div>
  );
}
