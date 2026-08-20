"use client";

import { SAMPLE_GITLOG, SAMPLE_NOTES } from "@/components/studio/samples";
import type { SourceMode } from "@/lib/types";

const MODES: { id: SourceMode; label: string; hint: string }[] = [
  { id: "auto", label: "Auto", hint: "Detect the format" },
  { id: "gitlog", label: "git log", hint: "Full log output, with commit headers" },
  { id: "commits", label: "Commits", hint: "One conventional commit per line" },
  { id: "notes", label: "Notes", hint: "Plain sentences, no commit prefixes" },
];

type SourcePanelProps = {
  source: string;
  mode: SourceMode;
  parsedCount: number;
  onSourceChange: (value: string) => void;
  onModeChange: (mode: SourceMode) => void;
  onParse: () => void;
};

export default function SourcePanel({
  source,
  mode,
  parsedCount,
  onSourceChange,
  onModeChange,
  onParse,
}: SourcePanelProps) {
  const lines = source.trim() ? source.trim().split("\n").length : 0;

  return (
    <section className="panel">
      <header className="panel-head">
        <span className="label">
          01 <span style={{ color: "var(--line-strong)" }}>/</span> Source
        </span>
        <div className="seg" role="group" aria-label="Source format">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.hint}
              data-active={mode === item.id}
              aria-pressed={mode === item.id}
              onClick={() => onModeChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-3.5">
        <label className="sr-only" htmlFor="studio-source">
          Paste commits or notes
        </label>
        <textarea
          id="studio-source"
          value={source}
          onChange={(event) => onSourceChange(event.target.value)}
          spellCheck={false}
          rows={9}
          placeholder={`Paste a git log, a list of commits, or plain notes.\n\nfeat(auth): add passkey sign-in (#812)\nfix(billing): stop double-charging annual plans\n- Redesigned the empty states`}
          className="field resize-y"
          style={{ minHeight: 168, lineHeight: 1.7 }}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" onClick={onParse}>
            Parse
            <kbd className="kbd" style={{ borderColor: "transparent", background: "rgb(0 0 0 / 14%)", color: "inherit" }}>
              ⌘↵
            </kbd>
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => onSourceChange(SAMPLE_GITLOG)}
          >
            Sample git log
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => onSourceChange(SAMPLE_NOTES)}
          >
            Sample notes
          </button>

          <span className="label ml-auto tabular">
            {lines} line{lines === 1 ? "" : "s"}
            {parsedCount > 0 ? ` · ${parsedCount} parsed` : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
