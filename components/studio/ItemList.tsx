"use client";

import { tagConfig, tagOrder, tagVars } from "@/lib/tagConfig";
import type { ParsedItem, TagType } from "@/lib/types";

type ItemListProps = {
  items: ParsedItem[];
  onToggle: (id: string) => void;
  onRetype: (id: string, type: TagType) => void;
  onEdit: (id: string, subject: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onSetAll: (included: boolean) => void;
};

export default function ItemList({
  items,
  onToggle,
  onRetype,
  onEdit,
  onMove,
  onSetAll,
}: ItemListProps) {
  const included = items.filter((item) => item.included).length;

  return (
    <section className="panel">
      <header className="panel-head">
        <span className="label">
          02 <span style={{ color: "var(--line-strong)" }}>/</span> Changes
          {items.length > 0 ? (
            <span className="ml-2 tabular" style={{ color: "var(--text-muted)" }}>
              {included}/{items.length}
            </span>
          ) : null}
        </span>

        {items.length > 0 ? (
          <div className="flex gap-1.5">
            <button type="button" className="btn btn-sm" onClick={() => onSetAll(true)}>
              All
            </button>
            <button type="button" className="btn btn-sm" onClick={() => onSetAll(false)}>
              None
            </button>
          </div>
        ) : null}
      </header>

      {items.length === 0 ? (
        <p
          className="px-4 py-10 text-center font-sans text-[13px] leading-6"
          style={{ color: "var(--text-faint)" }}
        >
          Nothing parsed yet. Paste something above and press Parse — the
          parser reads conventional commits, raw git log, and plain sentences.
        </p>
      ) : (
        <ul className="m-0 max-h-[520px] list-none overflow-y-auto p-0">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="commit-row"
              data-included={item.included}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={item.included}
                aria-label={`Include: ${item.subject}`}
                className="check"
                data-checked={item.included}
                onClick={() => onToggle(item.id)}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`type-${item.id}`}>
                    Category for {item.subject}
                  </label>
                  <select
                    id={`type-${item.id}`}
                    value={item.type}
                    onChange={(event) =>
                      onRetype(item.id, event.target.value as TagType)
                    }
                    className="tag shrink-0 cursor-pointer appearance-none pr-2"
                    style={tagVars(item.type)}
                  >
                    {tagOrder.map((tag) => (
                      <option key={tag} value={tag}>
                        {tagConfig[tag].label}
                      </option>
                    ))}
                  </select>

                  <label className="sr-only" htmlFor={`subject-${item.id}`}>
                    Wording for this change
                  </label>
                  <input
                    id={`subject-${item.id}`}
                    value={item.subject}
                    onChange={(event) => onEdit(item.id, event.target.value)}
                    className="min-w-0 flex-1 rounded-[4px] border border-transparent bg-transparent px-1.5 py-1 font-sans text-[13px] outline-none transition-colors focus:border-[color:var(--accent-line)] focus:bg-[color:var(--surface-inset)]"
                    style={{ color: "var(--text-secondary)" }}
                  />
                </div>

                {item.scope || item.hash || item.pr || item.rawType ? (
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 pl-1.5">
                    {item.rawType ? (
                      <span className="meta">
                        {item.rawType}
                        {item.scope ? `(${item.scope})` : ""}
                        {item.breaking ? "!" : ""}
                      </span>
                    ) : null}
                    {item.pr ? (
                      <span className="meta">
                        #{item.pr}
                      </span>
                    ) : null}
                    {item.hash ? (
                      <span className="meta">
                        {item.hash}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  className="btn btn-ghost h-5 px-1.5"
                  aria-label={`Move "${item.subject}" earlier`}
                  disabled={index === 0}
                  onClick={() => onMove(item.id, -1)}
                >
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 7.5L6 4l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost h-5 px-1.5"
                  aria-label={`Move "${item.subject}" later`}
                  disabled={index === items.length - 1}
                  onClick={() => onMove(item.id, 1)}
                >
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
