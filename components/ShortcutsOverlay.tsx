"use client";

import { useApp } from "@/components/providers/AppProvider";

const GROUPS: { title: string; rows: [string[], string][] }[] = [
  {
    title: "Anywhere",
    rows: [
      [["⌘", "K"], "Open the command bar"],
      [["?"], "Show this sheet"],
      [["T"], "Switch between ink and newsprint"],
      [["G", "H"], "Go to the changelog"],
      [["G", "S"], "Go to the studio"],
    ],
  },
  {
    title: "Reading",
    rows: [
      [["J"], "Next release"],
      [["K"], "Previous release"],
      [["/"], "Search releases"],
      [["Esc"], "Clear search and filters"],
    ],
  },
  {
    title: "Studio",
    rows: [
      [["⌘", "↵"], "Parse the source"],
      [["⌘", "S"], "Copy the current export"],
    ],
  },
];

export default function ShortcutsOverlay() {
  const { shortcutsOpen, setShortcutsOpen } = useApp();

  if (!shortcutsOpen) return null;

  return (
    <div
      className="scrim flex items-center justify-center p-6"
      onClick={() => setShortcutsOpen(false)}
      role="presentation"
    >
      <div
        className="dialog w-full max-w-[520px] p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[21px]" style={{ color: "var(--text-primary)" }}>
            Keyboard
          </h2>
          <button
            type="button"
            className="label"
            onClick={() => setShortcutsOpen(false)}
            style={{ cursor: "pointer" }}
          >
            Esc to close
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <p className="label mb-2.5">{group.title}</p>
              <dl className="flex flex-col gap-1.5">
                {group.rows.map(([keys, description]) => (
                  <div
                    key={description}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt
                      className="font-sans text-[13.5px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {description}
                    </dt>
                    <dd className="flex shrink-0 items-center gap-1">
                      {keys.map((key) => (
                        <kbd key={key} className="kbd">
                          {key}
                        </kbd>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
