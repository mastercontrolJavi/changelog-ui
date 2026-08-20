"use client";

import type { RefObject } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { tagConfig, tagOrder, tagVars } from "@/lib/tagConfig";
import type { TagType } from "@/lib/types";

type FilterBarProps = {
  filters: TagType[];
  counts: Partial<Record<TagType, number>>;
  total: number;
  visible: number;
  query: string;
  searchRef: RefObject<HTMLInputElement>;
  onQueryChange: (value: string) => void;
  onToggle: (tag: TagType) => void;
  onClear: () => void;
};

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7.2" cy="7.2" r="4.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.6 10.6L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FilterBar({
  filters,
  counts,
  total,
  visible,
  query,
  searchRef,
  onQueryChange,
  onToggle,
  onClear,
}: FilterBarProps) {
  const { density, toggleDensity } = useApp();
  const showingAll = filters.length === 0;
  const narrowed = !showingAll || query.trim().length > 0;

  return (
    <div
      className="sticky z-40 py-3"
      style={{
        top: "var(--header-h)",
        background: "color-mix(in srgb, var(--surface-base) 88%, transparent)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line-subtle)",
      }}
    >
      <div className="shell">
        <div className="column flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-faint)" }}
              >
                <SearchIcon />
              </span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search releases"
                aria-label="Search releases"
                className="field !pl-9"
                style={{ height: 34 }}
              />
              {query ? null : (
                <kbd
                  className="kbd pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                >
                  /
                </kbd>
              )}
            </div>

            <div className="seg shrink-0" role="group" aria-label="Reading density">
              <button
                type="button"
                data-active={density === "comfortable"}
                aria-pressed={density === "comfortable"}
                onClick={() => density !== "comfortable" && toggleDensity()}
              >
                Roomy
              </button>
              <button
                type="button"
                data-active={density === "compact"}
                aria-pressed={density === "compact"}
                onClick={() => density !== "compact" && toggleDensity()}
              >
                Dense
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav
              aria-label="Filter releases by tag"
              className="filter-scroll -mx-1 flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto px-1 py-0.5 sm:flex-wrap sm:overflow-x-visible"
            >
              <button
                type="button"
                className="pill"
                data-active={showingAll}
                aria-pressed={showingAll}
                onClick={onClear}
              >
                All
                <span className="pill-count tabular">{total}</span>
              </button>

              {tagOrder.map((tag) => {
                const count = counts[tag] ?? 0;
                if (count === 0) return null;
                const active = filters.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    className="pill"
                    data-active={active}
                    aria-pressed={active}
                    title={tagConfig[tag].blurb}
                    onClick={() => onToggle(tag)}
                    style={
                      active
                        ? {
                            ...tagVars(tag),
                            borderColor: "var(--tag-line)",
                            background: "var(--tag-bg)",
                            color: "var(--tag-fg)",
                          }
                        : undefined
                    }
                  >
                    {tagConfig[tag].label}
                    <span className="pill-count tabular">{count}</span>
                  </button>
                );
              })}
            </nav>

            {narrowed ? (
              <p
                className="label shrink-0 whitespace-nowrap"
                aria-live="polite"
                style={{ color: "var(--text-muted)" }}
              >
                {visible} of {total}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
