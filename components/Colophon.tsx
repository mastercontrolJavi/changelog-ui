"use client";

import { useEffect, useState } from "react";

const NOTES: { term: string; detail: string }[] = [
  {
    term: "Type",
    detail:
      "Fraunces carries the editorial voice - its optical-size axis lets one family set a 116px masthead and a 22px entry title without either looking stretched. IBM Plex Sans reads the prose, JetBrains Mono holds every number, tag, and key.",
  },
  {
    term: "Stock",
    detail:
      "Two themes, not one inverted. Ink is a warm near-black with gold foil; newsprint is a paper white with a darker, higher-contrast gold. Tag colours are redefined per theme rather than reused, so nothing drops below contrast in the light view.",
  },
  {
    term: "Texture",
    detail:
      "A fixed SVG grain layer and a soft vignette sit above the page in overlay blend mode. It is the difference between a screen and a printed surface, and it costs one element.",
  },
  {
    term: "State",
    detail:
      "Tag filters live in the URL so a filtered view is shareable, but filtering happens locally - the click and the result are the same frame. Theme and density are applied before first paint by an inline script, so a stored preference never flashes.",
  },
  {
    term: "Motion",
    detail:
      "One orchestrated page-load stagger, then scroll reveals handled by a single IntersectionObserver for the whole feed. Everything is capped around 340ms and every animation collapses under prefers-reduced-motion.",
  },
  {
    term: "The studio",
    detail:
      "The generator parses conventional commits, raw git log, or plain notes, infers the semver bump, and writes the result in four voices across seven formats. The preview renders through the same CSS as the feed, so what you see is the entry you get.",
  },
];

export default function Colophon() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-[11px] transition-colors"
        style={{ color: "var(--text-faint)" }}
      >
        Colophon
      </button>

      {open ? (
        <div
          className="scrim flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="dialog my-auto w-full max-w-[600px] p-6 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="colophon-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label" style={{ color: "var(--accent)" }}>
                  Colophon
                </p>
                <h2
                  id="colophon-title"
                  className="mt-2 font-display text-[26px] leading-tight"
                  style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                >
                  How this was set
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-sm shrink-0"
                aria-label="Close the colophon"
              >
                Esc
              </button>
            </div>

            <p
              className="mt-4 font-sans text-[14px] leading-[1.7]"
              style={{ color: "var(--text-muted)" }}
            >
              A changelog is a publication, so this one is set like one. It is
              also a tool: the studio writes the entries the feed publishes.
            </p>

            <hr className="rule my-5" />

            <dl className="flex flex-col gap-4">
              {NOTES.map((note) => (
                <div key={note.term} className="grid gap-1 sm:grid-cols-[104px_1fr] sm:gap-4">
                  <dt className="label pt-1">{note.term}</dt>
                  <dd
                    className="m-0 font-sans text-[13.5px] leading-[1.68]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {note.detail}
                  </dd>
                </div>
              ))}
            </dl>

            <hr className="rule my-5" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {["Next.js 14", "TypeScript", "Tailwind v4", "MDX", "date-fns"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-[4px] px-2 py-1 font-mono text-[10px]"
                      style={{
                        border: "1px solid var(--line-subtle)",
                        color: "var(--text-faint)",
                      }}
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>

              <a
                href="https://javiertpadilla.com"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11.5px]"
                style={{ color: "var(--accent)" }}
              >
                javiertpadilla.com →
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
