"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import TagBadge from "@/components/TagBadge";
import { formatEntryDate } from "@/lib/format";
import type { ChangelogEntry as ChangelogEntryType } from "@/lib/types";

type ChangelogEntryProps = {
  entry: ChangelogEntryType;
  /** Precomputed on the server so client and server agree on "now". */
  relative: string;
  isLatest?: boolean;
  /** Server-rendered MDX prose. */
  children: ReactNode;
};

export default function ChangelogEntry({
  entry,
  relative,
  isLatest = false,
  children,
}: ChangelogEntryProps) {
  const [copied, setCopied] = useState(false);

  const copyPermalink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${entry.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard unavailable — the anchor link still works. */
    }
  };

  return (
    <article
      id={entry.id}
      className="entry-card group/entry"
      data-highlight={entry.highlight ? "true" : "false"}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span
            className="font-mono text-[12px] font-medium tabular"
            style={{
              color: entry.highlight ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {entry.version}
          </span>

          {isLatest ? (
            <span
              className="label rounded-full px-2 py-1"
              style={{
                background: "var(--accent-wash)",
                color: "var(--accent)",
                border: "1px solid var(--accent-line)",
              }}
            >
              Latest
            </span>
          ) : null}

          <span aria-hidden="true" style={{ color: "var(--line-strong)" }}>
            ·
          </span>

          <time
            dateTime={entry.date}
            title={relative}
            className="font-mono text-[12px] tabular"
            style={{ color: "var(--text-faint)" }}
          >
            {formatEntryDate(entry.date)}
          </time>
        </div>

        <button
          type="button"
          onClick={copyPermalink}
          aria-label={`Copy a link to ${entry.version}`}
          className="btn btn-sm shrink-0 opacity-0 transition-opacity duration-200 focus-visible:opacity-100 group-hover/entry:opacity-100"
          style={
            copied
              ? { color: "var(--accent)", borderColor: "var(--accent-line)" }
              : undefined
          }
        >
          {copied ? "link copied" : "link"}
        </button>
      </div>

      <h2 className="entry-title mt-2 text-[clamp(20px,2.6vw,25px)] leading-[1.22]">
        <a
          href={`#${entry.id}`}
          className="inline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ outlineColor: "var(--accent)" }}
        >
          {entry.title}
          <span className="anchor-mark font-mono text-[15px]" aria-hidden="true">
            #
          </span>
        </a>
      </h2>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      {children}
    </article>
  );
}
