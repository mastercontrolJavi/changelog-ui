"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChangelogEntry from "@/components/ChangelogEntry";
import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import { isTypingTarget } from "@/components/providers/AppProvider";
import { useReveal } from "@/hooks/useReveal";
import { entryYear, matchesQuery } from "@/lib/format";
import { parseFiltersFromParam, tagOrder } from "@/lib/tagConfig";
import type { ChangelogEntry as ChangelogEntryType, TagType } from "@/lib/types";

export type FeedItem = {
  entry: ChangelogEntryType;
  /** Rendered on the server; the client only decides whether to show it. */
  body: ReactNode;
  relative: string;
};

type ChangelogFeedProps = {
  items: FeedItem[];
  initialFilters: TagType[];
};

function sameFilters(left: TagType[], right: TagType[]) {
  return (
    left.length === right.length && left.every((tag, i) => tag === right[i])
  );
}

export default function ChangelogFeed({
  items,
  initialFilters,
}: ChangelogFeedProps) {
  const [filters, setFilters] = useState<TagType[]>(initialFilters);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => {
    const result: Partial<Record<TagType, number>> = {};
    for (const item of items) {
      for (const tag of item.entry.tags) {
        result[tag] = (result[tag] ?? 0) + 1;
      }
    }
    return result;
  }, [items]);

  const visible = useMemo(
    () =>
      items.filter(
        ({ entry }) =>
          (filters.length === 0 ||
            entry.tags.some((tag) => filters.includes(tag))) &&
          matchesQuery(entry, query),
      ),
    [items, filters, query],
  );

  const containerRef = useReveal<HTMLDivElement>([
    visible.map((item) => item.entry.id).join(","),
  ]);

  /* Filters live in the URL so a filtered view can be shared, but the list
     itself re-renders locally - no round trip between a click and the result. */
  const syncUrl = useCallback((next: TagType[]) => {
    const params = new URLSearchParams(window.location.search);
    if (next.length) params.set("tags", next.join(","));
    else params.delete("tags");
    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`,
    );
  }, []);

  useEffect(() => {
    const readFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const next = parseFiltersFromParam(params.get("tags"));
      setFilters((current) => (sameFilters(current, next) ? current : next));
    };

    window.addEventListener("popstate", readFromUrl);
    return () => window.removeEventListener("popstate", readFromUrl);
  }, []);

  const toggleFilter = useCallback(
    (tag: TagType) => {
      setFilters((current) => {
        const next = current.includes(tag)
          ? current.filter((value) => value !== tag)
          : tagOrder.filter(
              (candidate) => candidate === tag || current.includes(candidate),
            );
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const clearFilters = useCallback(() => {
    setFilters([]);
    syncUrl([]);
  }, [syncUrl]);

  const resetView = useCallback(() => {
    setQuery("");
    clearFilters();
  }, [clearFilters]);

  /* Reading shortcuts: j/k walk the feed, "/" jumps to search, Esc resets. */
  useEffect(() => {
    const ids = visible.map((item) => item.entry.id);
    let cursor = -1;

    const activeIndex = () => {
      const line = window.scrollY + window.innerHeight / 3;
      for (let i = ids.length - 1; i >= 0; i -= 1) {
        const element = document.getElementById(ids[i]);
        if (element && element.offsetTop <= line) return i;
      }
      return 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "Escape" && isTypingTarget(event.target)) {
        (event.target as HTMLElement).blur();
        resetView();
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      if (event.key === "Escape") {
        resetView();
        return;
      }

      if (event.key !== "j" && event.key !== "k") return;
      if (ids.length === 0) return;

      event.preventDefault();
      if (cursor === -1) cursor = activeIndex();
      cursor =
        event.key === "j"
          ? Math.min(cursor + 1, ids.length - 1)
          : Math.max(cursor - 1, 0);
      document
        .getElementById(ids[cursor])
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, resetView]);

  let lastYear = "";

  return (
    <>
      <FilterBar
        filters={filters}
        counts={counts}
        total={items.length}
        visible={visible.length}
        query={query}
        searchRef={searchRef}
        onQueryChange={setQuery}
        onToggle={toggleFilter}
        onClear={clearFilters}
      />

      <div ref={containerRef} className="shell relative pt-9">
        <div className="column relative">
        {visible.length === 0 ? (
          <EmptyState
            title="Nothing matches yet"
            hint="No release carries every tag you picked. Drop a filter, or clear the search."
            onReset={resetView}
          />
        ) : (
          <>
            <span className="spine hidden sm:block" aria-hidden="true" />

            <div className="flex flex-col gap-11">
              {visible.map((item, index) => {
                const year = entryYear(item.entry.date);
                const showYear = year !== lastYear;
                lastYear = year;

                return (
                  <div key={item.entry.id}>
                    {showYear ? (
                      <div className="year-mark mb-7 flex items-center gap-3 sm:pl-8">
                        <span
                          className="label px-2 py-1"
                          style={{
                            background: "var(--surface-base)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--line-subtle)",
                            borderRadius: 999,
                          }}
                        >
                          {year}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-px flex-1"
                          style={{
                            background:
                              "linear-gradient(90deg, var(--line), transparent)",
                          }}
                        />
                      </div>
                    ) : null}

                    <div className="reveal relative sm:pl-8">
                      <span
                        className="node hidden sm:block"
                        aria-hidden="true"
                        data-highlight={item.entry.highlight ? "true" : "false"}
                        data-latest={index === 0 ? "true" : "false"}
                      />
                      <ChangelogEntry
                        entry={item.entry}
                        relative={item.relative}
                        isLatest={index === 0 && filters.length === 0 && !query}
                      >
                        {item.body}
                      </ChangelogEntry>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        </div>
      </div>
    </>
  );
}
