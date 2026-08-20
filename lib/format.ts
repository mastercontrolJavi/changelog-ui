import { differenceInCalendarDays, format, parseISO } from "date-fns";
import type { ChangelogEntry, TagType } from "./types";

export function formatEntryDate(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function formatShortDate(iso: string) {
  return format(parseISO(iso), "MMM d");
}

export function entryYear(iso: string) {
  return format(parseISO(iso), "yyyy");
}

/** "3 days ago" / "today" - computed against a caller-supplied "now" so the
 *  server and the client cannot disagree across a midnight boundary. */
export function relativeDays(iso: string, now: Date) {
  const days = differenceInCalendarDays(now, parseISO(iso));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export interface FeedStats {
  releases: number;
  breaking: number;
  latestVersion: string;
  latestDate: string;
  /** Mean days between releases, rounded. */
  cadenceDays: number;
  spanLabel: string;
}

export function computeStats(entries: ChangelogEntry[]): FeedStats {
  if (entries.length === 0) {
    return {
      releases: 0,
      breaking: 0,
      latestVersion: "--",
      latestDate: "",
      cadenceDays: 0,
      spanLabel: "",
    };
  }

  const sorted = [...entries].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
  );
  const newest = sorted[0];
  const oldest = sorted[sorted.length - 1];
  const span = differenceInCalendarDays(
    parseISO(newest.date),
    parseISO(oldest.date),
  );

  return {
    releases: entries.length,
    breaking: entries.filter((entry) => entry.tags.includes("breaking")).length,
    latestVersion: newest.version,
    latestDate: newest.date,
    cadenceDays: sorted.length > 1 ? Math.round(span / (sorted.length - 1)) : 0,
    spanLabel:
      sorted.length > 1
        ? `${format(parseISO(oldest.date), "MMM yyyy")} - ${format(
            parseISO(newest.date),
            "MMM yyyy",
          )}`
        : format(parseISO(newest.date), "MMM yyyy"),
  };
}

export function countByTag(entries: ChangelogEntry[]) {
  const counts = {} as Record<TagType, number>;
  for (const entry of entries) {
    for (const tag of entry.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

/** Case-insensitive substring match across the fields a reader would search. */
export function matchesQuery(entry: ChangelogEntry, query: string) {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return (
    entry.title.toLowerCase().includes(needle) ||
    entry.version.toLowerCase().includes(needle) ||
    entry.tags.some((tag) => tag.includes(needle)) ||
    entry.content.toLowerCase().includes(needle)
  );
}

export interface ActivityMonth {
  key: string;
  /** "Aug" */
  label: string;
  /** "August 2026" - used by the tooltip and the table view. */
  fullLabel: string;
  count: number;
  versions: string[];
}

/**
 * Releases bucketed by calendar month, oldest first. Empty months are kept so
 * the gaps in a shipping rhythm are as visible as the bursts.
 */
export function monthlyActivity(
  entries: ChangelogEntry[],
  months: number,
  now: Date,
): ActivityMonth[] {
  const buckets: ActivityMonth[] = [];
  const index = new Map<string, ActivityMonth>();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const bucket: ActivityMonth = {
      key: format(date, "yyyy-MM"),
      label: format(date, "MMM"),
      fullLabel: format(date, "MMMM yyyy"),
      count: 0,
      versions: [],
    };
    buckets.push(bucket);
    index.set(bucket.key, bucket);
  }

  for (const entry of entries) {
    const bucket = index.get(format(parseISO(entry.date), "yyyy-MM"));
    if (!bucket) continue;
    bucket.count += 1;
    bucket.versions.push(entry.version);
  }

  return buckets;
}
