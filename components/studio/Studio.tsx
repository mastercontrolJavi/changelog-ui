"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ItemList from "@/components/studio/ItemList";
import OutputPanel from "@/components/studio/OutputPanel";
import ReleasePanel from "@/components/studio/ReleasePanel";
import SourcePanel from "@/components/studio/SourcePanel";
import { useApp } from "@/components/providers/AppProvider";
import { parseSource, suggestTitle, tagsFromItems } from "@/lib/parseCommits";
import { applyBump, inferBump } from "@/lib/semver";
import { tagOrder } from "@/lib/tagConfig";
import type {
  Audience,
  ExportFormat,
  ParsedItem,
  ReleaseDraft,
  SourceMode,
  TagType,
} from "@/lib/types";

const STORAGE_KEY = "cl:studio";

type StudioProps = {
  /** Both supplied by the server so the first client render matches the HTML. */
  today: string;
  latestVersion: string;
};

type Persisted = {
  source: string;
  mode: SourceMode;
  items: ParsedItem[];
  baseVersion: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  highlight: boolean;
  audience: Audience;
  tab: "preview" | ExportFormat;
  titleTouched: boolean;
};

export default function Studio({ today, latestVersion }: StudioProps) {
  const { toast } = useApp();

  const [source, setSource] = useState("");
  const [mode, setMode] = useState<SourceMode>("auto");
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [baseVersion, setBaseVersion] = useState(latestVersion);
  const [version, setVersion] = useState(() => applyBump(latestVersion, "patch"));
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [highlight, setHighlight] = useState(false);
  const [audience, setAudience] = useState<Audience>("engineering");
  const [tab, setTab] = useState<"preview" | ExportFormat>("preview");
  const [restored, setRestored] = useState(false);

  // Tracks whether the author has taken the title over from the suggester.
  const titleTouched = useRef(false);

  /* Restore a draft after mount — never during render, so the server HTML and
     the first client render stay identical. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Persisted>;
        if (typeof saved.source === "string") setSource(saved.source);
        if (saved.mode) setMode(saved.mode);
        if (Array.isArray(saved.items)) setItems(saved.items);
        if (saved.baseVersion) setBaseVersion(saved.baseVersion);
        if (saved.version) setVersion(saved.version);
        if (saved.date) setDate(saved.date);
        if (typeof saved.title === "string") setTitle(saved.title);
        if (typeof saved.summary === "string") setSummary(saved.summary);
        if (typeof saved.highlight === "boolean") setHighlight(saved.highlight);
        if (saved.audience) setAudience(saved.audience);
        if (saved.tab) setTab(saved.tab);
        titleTouched.current = Boolean(saved.titleTouched);
      }
    } catch {
      /* Corrupt or blocked storage: start from a clean draft. */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    const payload: Persisted = {
      source,
      mode,
      items,
      baseVersion,
      version,
      date,
      title,
      summary,
      highlight,
      audience,
      tab,
      titleTouched: titleTouched.current,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* Quota or private mode — the draft simply is not persisted. */
    }
  }, [
    restored,
    source,
    mode,
    items,
    baseVersion,
    version,
    date,
    title,
    summary,
    highlight,
    audience,
    tab,
  ]);

  const tags = useMemo<TagType[]>(
    () => tagsFromItems(items, tagOrder),
    [items],
  );
  const suggestedBump = useMemo(() => inferBump(items), [items]);

  const parse = useCallback(() => {
    const parsed = parseSource(source, mode);
    setItems(parsed);

    if (parsed.length === 0) {
      toast("Nothing to parse yet");
      return;
    }

    setVersion(applyBump(baseVersion, inferBump(parsed)));
    if (!titleTouched.current) setTitle(suggestTitle(parsed));

    const dropped = parsed.filter((item) => !item.included).length;
    toast(
      dropped > 0
        ? `${parsed.length} parsed, ${dropped} housekeeping left out`
        : `${parsed.length} changes parsed`,
      "success",
    );
  }, [source, mode, baseVersion, toast]);

  /* ⌘↵ parses from anywhere, including inside the textarea. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key === "Enter") {
        event.preventDefault();
        parse();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [parse]);

  const updateItem = useCallback(
    (id: string, patch: Partial<ParsedItem>) => {
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const moveItem = useCallback((id: string, direction: -1 | 1) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const draft = useMemo<ReleaseDraft>(
    () => ({
      version,
      date,
      title,
      summary,
      tags,
      highlight,
      audience,
      items,
    }),
    [version, date, title, summary, tags, highlight, audience, items],
  );

  const reset = () => {
    setSource("");
    setItems([]);
    setTitle("");
    setSummary("");
    setHighlight(false);
    setVersion(applyBump(baseVersion, "patch"));
    titleTouched.current = false;
    toast("Draft cleared");
  };

  return (
    <div className="shell pb-8">
      {/* Studio masthead */}
      <div className="flex flex-col gap-5 pb-7 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="label" style={{ color: "var(--accent)" }}>
            The composing room
          </span>
          <span aria-hidden="true" className="h-px w-6" style={{ background: "var(--line)" }} />
          <span className="label">Paste · curate · publish</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <h1
              className="font-display text-[clamp(34px,6vw,58px)] leading-[0.95]"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.032em",
                fontVariationSettings: '"SOFT" 0, "WONK" 1, "opsz" 80',
              }}
            >
              Write the <em className="foil" style={{ fontStyle: "italic" }}>release</em>
            </h1>
            <p
              className="mt-4 max-w-[54ch] font-sans text-[15px] leading-[1.62]"
              style={{ color: "var(--text-muted)" }}
            >
              Paste a git log, a list of commits, or plain notes. The studio
              sorts them into changelog categories, infers the semver bump,
              and writes the result in four voices across seven formats —
              entirely in your browser.
            </p>
          </div>

          <button type="button" className="btn" onClick={reset}>
            Clear draft
          </button>
        </div>
      </div>

      <hr className="rule" />

      <div className="studio-grid pt-6">
        <div className="studio-rail flex flex-col gap-4">
          <SourcePanel
            source={source}
            mode={mode}
            parsedCount={items.length}
            onSourceChange={setSource}
            onModeChange={setMode}
            onParse={parse}
          />

          <ItemList
            items={items}
            onToggle={(id) =>
              setItems((current) =>
                current.map((item) =>
                  item.id === id ? { ...item, included: !item.included } : item,
                ),
              )
            }
            onRetype={(id, type) => updateItem(id, { type })}
            onEdit={(id, subject) => updateItem(id, { subject })}
            onMove={moveItem}
            onSetAll={(included) =>
              setItems((current) =>
                current.map((item) => ({ ...item, included })),
              )
            }
          />
        </div>

        <div className="flex flex-col gap-4">
          <ReleasePanel
            baseVersion={baseVersion}
            version={version}
            date={date}
            title={title}
            summary={summary}
            highlight={highlight}
            audience={audience}
            tags={tags}
            items={items}
            suggestedBump={suggestedBump}
            onBaseVersionChange={setBaseVersion}
            onVersionChange={setVersion}
            onDateChange={setDate}
            onTitleChange={(value) => {
              titleTouched.current = true;
              setTitle(value);
            }}
            onSummaryChange={setSummary}
            onHighlightChange={setHighlight}
            onAudienceChange={setAudience}
            onSuggestTitle={() => {
              titleTouched.current = false;
              setTitle(suggestTitle(items));
            }}
          />

          <OutputPanel draft={draft} tab={tab} onTabChange={setTab} />
        </div>
      </div>
    </div>
  );
}
