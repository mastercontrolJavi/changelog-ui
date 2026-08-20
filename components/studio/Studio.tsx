"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HowItWorks from "@/components/studio/HowItWorks";
import ItemList from "@/components/studio/ItemList";
import OutputPanel from "@/components/studio/OutputPanel";
import ReleasePanel from "@/components/studio/ReleasePanel";
import SourcePanel from "@/components/studio/SourcePanel";
import Tour, { type TourStep } from "@/components/studio/Tour";
import { SAMPLE_GITLOG } from "@/components/studio/samples";
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
const TOUR_KEY = "cl:tour";

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
  const [tourOpen, setTourOpen] = useState(false);

  // Tracks whether the author has taken the title over from the suggester.
  const titleTouched = useRef(false);

  // Latest values for callbacks that must not clobber existing work.
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const itemsRef = useRef(items);
  itemsRef.current = items;

  /* Restore a draft after mount - never during render, so the server HTML and
     the first client render stay identical. */
  useEffect(() => {
    let hasDraft = false;
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

        hasDraft =
          Boolean(saved.source?.trim()) ||
          (Array.isArray(saved.items) && saved.items.length > 0);
      }

      // Offer the tour once, and only to someone with nothing to lose.
      if (!localStorage.getItem(TOUR_KEY) && !hasDraft) setTourOpen(true);
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
      /* Quota or private mode - the draft simply is not persisted. */
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

  const runParse = useCallback(
    (text: string, sourceMode: SourceMode) => {
    const parsed = parseSource(text, sourceMode);
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
    },
    [baseVersion, toast],
  );

  const parse = useCallback(
    () => runParse(source, mode),
    [runParse, source, mode],
  );

  /* The tour demonstrates rather than describes: it loads the sample and runs
     the parse so every later step has something real to point at. */
  const demoParse = useCallback(() => {
    if (sourceRef.current.trim() || itemsRef.current.length > 0) return;
    setSource(SAMPLE_GITLOG);
    setMode("auto");
    runParse(SAMPLE_GITLOG, "auto");
  }, [runParse]);

  const closeTour = useCallback(() => {
    setTourOpen(false);
    try {
      localStorage.setItem(TOUR_KEY, "seen");
    } catch {
      /* The tour simply offers itself again next visit. */
    }
  }, []);

  const tourSteps = useMemo<TourStep[]>(
    () => [
      {
        title: "Turn commits into release notes",
        body: "Four panels, about thirty seconds. I have loaded a real sample so every step has something to point at.",
        onEnter: demoParse,
      },
      {
        target: '[data-tour="source"]',
        title: "Paste whatever you have",
        body: "A git log, a list of commits, or plain sentences. Conventional commits are recognised, but they are not required: without a prefix the studio reads the wording to work out what kind of change it is.",
      },
      {
        target: '[data-tour="changes"]',
        title: "Curate the list",
        body: "Each line gets a category you can change. Uncheck what should not ship, reword anything, reorder it. Notice the chore commit is already unchecked: housekeeping is parsed, never silently dropped.",
      },
      {
        target: '[data-tour="release"]',
        title: "The version is inferred",
        body: "One commit here is marked breaking, so major is recommended and the number is filled in. Below that, a voice rewrites the same changes for a different reader. Switch between them and watch the preview.",
      },
      {
        target: '[data-tour="output"]',
        title: "Preview, then take it with you",
        body: "Preview renders through the same components as the published feed, so it is exactly what ships. The other tabs are the same notes as Markdown, MDX, JSON and four more. Copy or download any of them.",
      },
      {
        title: "That is the whole tool",
        body: "Clear the draft, paste your own git log, and press Parse. Nothing leaves your browser, and your draft is saved as you go.",
      },
    ],
    [demoParse],
  );

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
              and writes the result in four voices across seven formats -
              entirely in your browser.
            </p>
          </div>

          <button type="button" className="btn" onClick={reset}>
            Clear draft
          </button>
        </div>
      </div>

      <hr className="rule" />

      <div className="pt-6">
        <HowItWorks onStartTour={() => setTourOpen(true)} />
      </div>

      <div className="studio-grid">
        <div className="studio-rail flex flex-col gap-4">
          <div data-tour="source">
            <SourcePanel
            source={source}
            mode={mode}
            parsedCount={items.length}
            onSourceChange={setSource}
            onModeChange={setMode}
            onParse={parse}
            />
          </div>

          <div data-tour="changes">
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
        </div>

        <div className="flex flex-col gap-4">
          <div data-tour="release">
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
          </div>

          <div data-tour="output">
            <OutputPanel draft={draft} tab={tab} onTabChange={setTab} />
          </div>
        </div>
      </div>

      <Tour steps={tourSteps} open={tourOpen} onClose={closeTour} />
    </div>
  );
}
