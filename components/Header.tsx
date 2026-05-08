"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseFiltersFromParam, tagConfig, tagOrder } from "@/lib/tagConfig";
import type { TagType } from "@/lib/types";

type HeaderProps = {
  initialFilters: TagType[];
};

function areFiltersEqual(left: TagType[], right: TagType[]) {
  return left.length === right.length && left.every((tag, index) => tag === right[index]);
}

export default function Header({ initialFilters }: HeaderProps) {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<TagType[]>(initialFilters);
  const allActive = activeFilters.length === 0;

  useEffect(() => {
    const syncFiltersFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      const nextFilters = parseFiltersFromParam(params.get("tags"));

      setActiveFilters((currentFilters) =>
        areFiltersEqual(currentFilters, nextFilters) ? currentFilters : nextFilters,
      );
    };

    syncFiltersFromLocation();
    window.addEventListener("popstate", syncFiltersFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFiltersFromLocation);
    };
  }, []);

  const updateUrlFilters = (nextFilters: TagType[]) => {
    const params = new URLSearchParams(window.location.search);

    if (nextFilters.length > 0) {
      params.set("tags", nextFilters.join(","));
    } else {
      params.delete("tags");
    }

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${
      window.location.hash
    }`;

    router.replace(nextUrl, { scroll: false });
  };

  const clearFilters = () => {
    setActiveFilters([]);
    updateUrlFilters([]);
  };

  const toggleFilter = (tag: TagType) => {
    const nextFilters = activeFilters.includes(tag)
      ? activeFilters.filter((activeTag) => activeTag !== tag)
      : tagOrder.filter((candidate) => candidate === tag || activeFilters.includes(candidate));

    setActiveFilters(nextFilters);
    updateUrlFilters(nextFilters);
  };

  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-[960px] flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
        <a
          href="#top"
          className="shrink-0 font-display text-[clamp(20px,3vw,32px)] font-light italic leading-none text-[#F0E8DC]"
        >
          Changelog
        </a>

        <nav
          aria-label="Filter changelog entries"
          className="filter-scroll -mx-1 flex min-w-0 flex-1 justify-start gap-2 overflow-x-auto px-1 sm:justify-end"
        >
          <button
            type="button"
            aria-pressed={allActive}
            onClick={clearFilters}
            className="h-[26px] shrink-0 rounded-[4px] border px-[10px] py-1 font-mono text-[11px] font-medium leading-4 transition-colors hover:bg-[#1E1916] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A853]"
            style={
              allActive
                ? ({
                    backgroundColor: "#1F1A0E",
                    borderColor: "#D4A853",
                    color: "#D4A853",
                  } satisfies CSSProperties)
                : ({
                    backgroundColor: "transparent",
                    borderColor: "#2A2420",
                    color: "#7A6A5A",
                  } satisfies CSSProperties)
            }
          >
            All
          </button>

          {tagOrder.map((tag) => {
            const isActive = activeFilters.includes(tag);
            const config = tagConfig[tag];

            return (
              <button
                key={tag}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggleFilter(tag)}
                className="h-[26px] shrink-0 rounded-[4px] border px-[10px] py-1 font-mono text-[11px] font-medium leading-4 transition-colors hover:bg-[#1E1916] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A853]"
                style={
                  isActive
                    ? ({
                        backgroundColor: config.background,
                        borderColor: config.border,
                        color: config.color,
                      } satisfies CSSProperties)
                    : ({
                        backgroundColor: "transparent",
                        borderColor: "#2A2420",
                        color: "#7A6A5A",
                      } satisfies CSSProperties)
                }
              >
                {config.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
