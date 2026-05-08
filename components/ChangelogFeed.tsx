import ChangelogEntry from "@/components/ChangelogEntry";
import EmptyState from "@/components/EmptyState";
import type { ChangelogEntry as ChangelogEntryType } from "@/lib/types";

type ChangelogFeedProps = {
  entries: ChangelogEntryType[];
};

export default function ChangelogFeed({ entries }: ChangelogFeedProps) {
  if (entries.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="relative sm:before:absolute sm:before:bottom-0 sm:before:left-[4px] sm:before:top-0 sm:before:w-px sm:before:bg-[#2A2420]">
      <div className="flex flex-col gap-12">
        {entries.map((entry) => (
          <div key={entry.id} className="relative sm:pl-8">
            <span
              aria-hidden="true"
              className={`absolute top-[9px] hidden rounded-full sm:block ${
                entry.highlight
                  ? "left-[-1px] h-[10px] w-[10px] bg-[#D4A853]"
                  : "left-0 h-2 w-2 bg-[#2A2420]"
              }`}
            />
            <ChangelogEntry entry={entry} />
          </div>
        ))}
      </div>
    </div>
  );
}
