"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ChangelogEntry from "@/components/ChangelogEntry";
import Markdown from "@/lib/miniMarkdown";
import { useApp } from "@/components/providers/AppProvider";
import {
  buildEntryBody,
  exportFilename,
  exportFormats,
  renderExport,
} from "@/lib/exporters";
import { versionSlug } from "@/lib/semver";
import type { ExportFormat, ReleaseDraft } from "@/lib/types";

type Tab = "preview" | ExportFormat;

type OutputPanelProps = {
  draft: ReleaseDraft;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default function OutputPanel({
  draft,
  tab,
  onTabChange,
}: OutputPanelProps) {
  const { toast } = useApp();
  const [copied, setCopied] = useState(false);

  const included = draft.items.filter((item) => item.included);

  const body = useMemo(() => buildEntryBody(draft), [draft]);

  const output = useMemo(
    () => (tab === "preview" ? "" : renderExport(draft, tab)),
    [draft, tab],
  );

  const copy = useCallback(async () => {
    const text = tab === "preview" ? body : renderExport(draft, tab);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast(
        tab === "preview" ? "Entry body copied" : "Copied as " + tab,
        "success",
      );
    } catch {
      toast("Could not reach the clipboard");
    }
  }, [tab, body, draft, toast]);

  /* ⌘S saves a draft everywhere else, so here it copies the current output
     rather than letting the browser offer to save the page. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") {
        return;
      }
      event.preventDefault();
      void copy();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [copy]);

  const download = () => {
    const format: ExportFormat = tab === "preview" ? "markdown" : tab;
    const blob = new Blob([renderExport(draft, format)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFilename(draft, format);
    anchor.click();
    URL.revokeObjectURL(url);
    toast(`Saved ${anchor.download}`, "success");
  };

  const meta = exportFormats.find((format) => format.id === tab);

  return (
    <section className="panel overflow-hidden">
      <header className="panel-head">
        <span className="label">
          04 <span style={{ color: "var(--line-strong)" }}>/</span> Output
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="btn btn-sm"
            onClick={copy}
            style={
              copied
                ? { color: "var(--accent)", borderColor: "var(--accent-line)" }
                : undefined
            }
          >
            {copied ? "copied" : "copy"}
            <kbd className="kbd">⌘S</kbd>
          </button>
          <button type="button" className="btn btn-sm" onClick={download}>
            download
          </button>
        </div>
      </header>

      <div
        className="filter-scroll flex flex-wrap gap-1 px-3 py-2"
        style={{ borderBottom: "1px solid var(--line-subtle)" }}
        role="tablist"
        aria-label="Output format"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "preview"}
          className="pill shrink-0"
          data-active={tab === "preview"}
          onClick={() => onTabChange("preview")}
        >
          Preview
        </button>
        {exportFormats.map((format) => (
          <button
            key={format.id}
            type="button"
            role="tab"
            aria-selected={tab === format.id}
            title={format.blurb}
            className="pill shrink-0"
            data-active={tab === format.id}
            onClick={() => onTabChange(format.id)}
          >
            {format.label}
          </button>
        ))}
      </div>

      {included.length === 0 ? (
        <p
          className="px-4 py-12 text-center font-sans text-[13px] leading-6"
          style={{ color: "var(--text-faint)" }}
        >
          Include at least one change and the output appears here, live.
        </p>
      ) : tab === "preview" ? (
        <div className="p-5 sm:p-6">
          <p className="label mb-4">
            Rendered with the same components and CSS as the published feed
          </p>
          <ChangelogEntry
            entry={{
              id: versionSlug(draft.version),
              version: draft.version || "v0.0.0",
              date: ISO_DATE.test(draft.date)
                ? draft.date
                : new Date().toISOString().slice(0, 10),
              title: draft.title || "Untitled release",
              tags: draft.tags,
              content: body,
              highlight: draft.highlight,
            }}
            relative="just now"
          >
            <div className="changelog-prose">
              <Markdown source={body} />
            </div>
          </ChangelogEntry>
        </div>
      ) : (
        <div>
          {meta ? (
            <p
              className="px-3.5 pt-3 font-sans text-[12px]"
              style={{ color: "var(--text-faint)" }}
            >
              {meta.blurb}
            </p>
          ) : null}
          <pre
            className="m-0 max-h-[560px] overflow-auto p-3.5 font-mono text-[12px] leading-[1.7]"
            style={{ color: "var(--text-secondary)" }}
          >
            <code>{output}</code>
          </pre>
        </div>
      )}
    </section>
  );
}
