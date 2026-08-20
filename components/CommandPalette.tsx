"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { entries } from "@/lib/entries";
import { tagConfig, tagOrder, tagVars } from "@/lib/tagConfig";
import { formatEntryDate } from "@/lib/format";

type Command = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keys?: string[];
  /** Extra text that should match but is not displayed. */
  terms?: string;
  swatch?: React.CSSProperties;
  run: () => void;
};

/**
 * Subsequence match with a bias toward prefixes and word starts, which is what
 * makes typing "v25" find "v2.5.0" and "brk" find "breaking".
 */
function score(haystack: string, needle: string): number {
  if (!needle) return 1;
  const text = haystack.toLowerCase();
  const query = needle.toLowerCase();

  if (text.startsWith(query)) return 1000 - text.length;
  const direct = text.indexOf(query);
  if (direct >= 0) return 700 - direct - text.length * 0.1;

  let cursor = 0;
  let points = 0;
  for (const char of query) {
    const found = text.indexOf(char, cursor);
    if (found === -1) return -1;
    points += found === 0 || /[\s.\-/]/.test(text[found - 1] ?? "") ? 6 : 2;
    cursor = found + 1;
  }
  return points;
}

export default function CommandPalette() {
  const router = useRouter();
  const {
    paletteOpen,
    setPaletteOpen,
    toggleTheme,
    toggleDensity,
    setShortcutsOpen,
    toast,
  } = useApp();

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setPaletteOpen(false);
    setQuery("");
    setCursor(0);
  }, [setPaletteOpen]);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      close();
      router.push(href);
    };

    const navigation: Command[] = [
      {
        id: "nav-home",
        group: "Go",
        label: "Changelog",
        hint: "The published feed",
        keys: ["G", "H"],
        run: go("/"),
      },
      {
        id: "nav-studio",
        group: "Go",
        label: "Studio",
        hint: "Generate release notes",
        keys: ["G", "S"],
        run: go("/studio"),
      },
      {
        id: "nav-rss",
        group: "Go",
        label: "RSS feed",
        hint: "/rss",
        terms: "subscribe atom feed",
        run: () => {
          close();
          window.open("/rss", "_blank", "noreferrer");
        },
      },
    ];

    const filters: Command[] = tagOrder.map((tag) => ({
      id: `filter-${tag}`,
      group: "Filter",
      label: tagConfig[tag].label,
      hint: tagConfig[tag].blurb,
      terms: `tag ${tag}`,
      swatch: tagVars(tag),
      run: () => {
        close();
        router.push(`/?tags=${tag}`);
      },
    }));

    const jumps: Command[] = entries.map((entry) => ({
      id: `jump-${entry.id}`,
      group: "Releases",
      label: entry.title,
      hint: `${entry.version} · ${formatEntryDate(entry.date)}`,
      terms: `${entry.version} ${entry.tags.join(" ")}`,
      run: () => {
        close();
        router.push(`/#${entry.id}`);
      },
    }));

    const actions: Command[] = [
      {
        id: "act-theme",
        group: "Appearance",
        label: "Switch stock",
        hint: "Ink or newsprint",
        keys: ["T"],
        terms: "theme dark light mode toggle",
        run: () => {
          close();
          toggleTheme();
        },
      },
      {
        id: "act-density",
        group: "Appearance",
        label: "Toggle density",
        hint: "Comfortable or compact",
        terms: "spacing compact comfortable",
        run: () => {
          close();
          toggleDensity();
        },
      },
      {
        id: "act-shortcuts",
        group: "Appearance",
        label: "Keyboard shortcuts",
        keys: ["?"],
        run: () => {
          close();
          setShortcutsOpen(true);
        },
      },
      {
        id: "act-copy",
        group: "Appearance",
        label: "Copy link to this view",
        terms: "share url permalink",
        run: () => {
          close();
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => toast("Link copied", "success"))
            .catch(() => toast("Could not reach the clipboard"));
        },
      },
    ];

    return [...navigation, ...filters, ...jumps, ...actions];
  }, [close, router, setShortcutsOpen, toggleDensity, toggleTheme, toast]);

  const results = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map((command) => ({
        command,
        rank: Math.max(
          score(command.label, query),
          score(`${command.group} ${command.terms ?? ""}`, query) - 40,
        ),
      }))
      .filter((row) => row.rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .map((row) => row.command);
  }, [commands, query]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    if (paletteOpen) inputRef.current?.focus();
  }, [paletteOpen]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor, results]);

  if (!paletteOpen) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)) {
      event.preventDefault();
      setCursor((index) => (results.length ? (index + 1) % results.length : 0));
      return;
    }
    if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey)) {
      event.preventDefault();
      setCursor((index) =>
        results.length ? (index - 1 + results.length) % results.length : 0,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      results[cursor]?.run();
    }
  };

  let lastGroup = "";

  return (
    <div
      className="scrim flex items-start justify-center px-4 pt-[12vh]"
      onClick={close}
      role="presentation"
    >
      <div
        className="dialog w-full max-w-[560px] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Command bar"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-center gap-2.5 px-4"
          style={{ borderBottom: "1px solid var(--line-subtle)" }}
        >
          <span
            className="font-mono text-[13px]"
            style={{ color: "var(--accent)" }}
            aria-hidden="true"
          >
            ›
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search releases, filters, and actions"
            aria-label="Search commands"
            className="h-[52px] w-full bg-transparent font-mono text-[13.5px] outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <div
          ref={listRef}
          className="max-h-[52vh] overflow-y-auto p-2"
          role="listbox"
          aria-label="Commands"
        >
          {results.length === 0 ? (
            <p
              className="px-3 py-8 text-center font-sans text-[13px]"
              style={{ color: "var(--text-faint)" }}
            >
              Nothing matches “{query}”
            </p>
          ) : (
            results.map((command, index) => {
              const showGroup = command.group !== lastGroup;
              lastGroup = command.group;

              return (
                <div key={command.id}>
                  {showGroup ? (
                    <p className="label px-3 pb-1.5 pt-3">{command.group}</p>
                  ) : null}
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === cursor}
                    data-active={index === cursor}
                    className="cmdk-item"
                    onMouseMove={() => setCursor(index)}
                    onClick={command.run}
                  >
                    {command.swatch ? (
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ ...command.swatch, background: "var(--tag-fg)" }}
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: "var(--line-strong)" }}
                      />
                    )}
                    <span
                      className="cmdk-label min-w-0 flex-1 truncate font-sans text-[13.5px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {command.label}
                    </span>
                    {command.hint ? (
                      <span
                        className="hidden shrink-0 font-mono text-[10.5px] sm:block"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {command.hint}
                      </span>
                    ) : null}
                    {command.keys ? (
                      <span className="flex shrink-0 gap-1">
                        {command.keys.map((key) => (
                          <kbd key={key} className="kbd">
                            {key}
                          </kbd>
                        ))}
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderTop: "1px solid var(--line-subtle)" }}
        >
          <span className="label">{results.length} results</span>
          <span className="flex items-center gap-2">
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd>
            <span className="label">navigate</span>
            <kbd className="kbd">↵</kbd>
            <span className="label">run</span>
          </span>
        </div>
      </div>
    </div>
  );
}
