"use client";

import TagBadge from "@/components/TagBadge";
import { applyBump, bumpReason, type Bump } from "@/lib/semver";
import { voiceOrder, voices } from "@/lib/voice";
import type { Audience, ParsedItem, TagType } from "@/lib/types";

const BUMPS: Bump[] = ["patch", "minor", "major"];

type ReleasePanelProps = {
  baseVersion: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  highlight: boolean;
  audience: Audience;
  tags: TagType[];
  items: ParsedItem[];
  suggestedBump: Bump;
  onBaseVersionChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onHighlightChange: (value: boolean) => void;
  onAudienceChange: (value: Audience) => void;
  onSuggestTitle: () => void;
};

function Field({
  label,
  htmlFor,
  children,
  action,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="label" htmlFor={htmlFor}>
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function ReleasePanel({
  baseVersion,
  version,
  date,
  title,
  summary,
  highlight,
  audience,
  tags,
  items,
  suggestedBump,
  onBaseVersionChange,
  onVersionChange,
  onDateChange,
  onTitleChange,
  onSummaryChange,
  onHighlightChange,
  onAudienceChange,
  onSuggestTitle,
}: ReleasePanelProps) {
  return (
    <section className="panel">
      <header className="panel-head">
        <span className="label">
          03 <span style={{ color: "var(--line-strong)" }}>/</span> Release
        </span>
        <label className="flex cursor-pointer items-center gap-2">
          <span className="label">Highlight</span>
          <span
            className="check"
            data-checked={highlight}
            role="checkbox"
            aria-checked={highlight}
            tabIndex={0}
            onClick={() => onHighlightChange(!highlight)}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                onHighlightChange(!highlight);
              }
            }}
          />
        </label>
      </header>

      <div className="flex flex-col gap-4 p-3.5">
        {/* Version, inferred from what the commits actually contain. */}
        <div className="flex flex-col gap-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Previous" htmlFor="studio-base">
              <input
                id="studio-base"
                value={baseVersion}
                onChange={(event) => onBaseVersionChange(event.target.value)}
                className="field"
                spellCheck={false}
              />
            </Field>
            <Field label="This release" htmlFor="studio-version">
              <input
                id="studio-version"
                value={version}
                onChange={(event) => onVersionChange(event.target.value)}
                className="field"
                spellCheck={false}
                style={{ color: "var(--accent)" }}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {BUMPS.map((bump) => {
              const next = applyBump(baseVersion, bump);
              const recommended = bump === suggestedBump;
              return (
                <button
                  key={bump}
                  type="button"
                  className="pill"
                  data-active={version === next}
                  onClick={() => onVersionChange(next)}
                  title={
                    recommended
                      ? `Recommended: ${bumpReason(items, suggestedBump)}`
                      : `Set ${next}`
                  }
                >
                  {bump}
                  <span className="pill-count">{next}</span>
                  {recommended ? (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="label" style={{ letterSpacing: "0.06em" }}>
            {suggestedBump} suggested - {bumpReason(items, suggestedBump)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
          <Field
            label="Title"
            htmlFor="studio-title"
            action={
              <button
                type="button"
                onClick={onSuggestTitle}
                className="label"
                style={{ color: "var(--accent)", cursor: "pointer" }}
              >
                Suggest
              </button>
            }
          >
            <input
              id="studio-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="What a reader should remember"
              className="field"
            />
          </Field>

          <Field label="Date" htmlFor="studio-date">
            <input
              id="studio-date"
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="field"
            />
          </Field>
        </div>

        <Field label="Summary - optional" htmlFor="studio-summary">
          <textarea
            id="studio-summary"
            value={summary}
            onChange={(event) => onSummaryChange(event.target.value)}
            rows={2}
            placeholder="Left blank, the studio writes an opening line from the change counts."
            className="field resize-y"
            style={{ fontFamily: "var(--font-body), sans-serif", fontSize: 13 }}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="label">Voice</span>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {voiceOrder.map((id) => {
              const voice = voices[id];
              const active = audience === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onAudienceChange(id)}
                  aria-pressed={active}
                  className="rounded-[7px] border p-2.5 text-left transition-colors"
                  style={{
                    borderColor: active ? "var(--accent-line)" : "var(--line-subtle)",
                    background: active ? "var(--accent-wash)" : "transparent",
                  }}
                >
                  <span
                    className="block font-mono text-[11.5px] font-medium"
                    style={{
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    {voice.label}
                  </span>
                  <span
                    className="mt-1 block font-sans text-[11.5px] leading-[1.5]"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {voice.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="label">Tags - derived from what you included</span>
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 ? (
              <span className="label">None yet</span>
            ) : (
              tags.map((tag) => <TagBadge key={tag} tag={tag} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
