"use client";

import { useState } from "react";
import type { ActivityMonth } from "@/lib/format";

type ReleaseRhythmProps = {
  months: ActivityMonth[];
};

const PLOT_HEIGHT = 64;

/**
 * Release cadence over the last year: one column per month, one series, so the
 * brand gold carries the data and every label stays in a text token. Empty
 * months keep their slot - the gaps are the point.
 */
export default function ReleaseRhythm({ months }: ReleaseRhythmProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(1, ...months.map((month) => month.count));
  const total = months.reduce((sum, month) => sum + month.count, 0);
  const busiest = months.reduce(
    (best, month, index) => (month.count > months[best].count ? index : best),
    0,
  );
  const active = hovered === null ? null : months[hovered];

  return (
    <figure className="m-0 w-full">
      <figcaption className="mb-3 flex items-baseline justify-between gap-3">
        <span className="label">Shipping rhythm</span>
        <span
          className="font-mono text-[10.5px] tabular"
          style={{ color: "var(--text-muted)" }}
          aria-live="polite"
        >
          {active
            ? `${active.fullLabel} · ${active.count} release${
                active.count === 1 ? "" : "s"
              }`
            : `${total} in 12 months`}
        </span>
      </figcaption>

      <div
        className="flex items-end gap-[2px]"
        style={{ height: PLOT_HEIGHT }}
        onMouseLeave={() => setHovered(null)}
        role="presentation"
      >
        {months.map((month, index) => {
          const filled = month.count > 0;
          // Empty months keep a 2px stub so the monthly beat stays readable.
          const height = filled
            ? Math.max(10, Math.round((month.count / max) * PLOT_HEIGHT))
            : 2;
          const dimmed = hovered !== null && hovered !== index;

          return (
            <div
              key={month.key}
              className="group/bar relative flex flex-1 justify-center"
              style={{ height: PLOT_HEIGHT }}
              onMouseEnter={() => setHovered(index)}
            >
              {/* Full-height hit target: the bar itself is too small to hover. */}
              <span className="absolute inset-0" aria-hidden="true" />
              <span
                className="absolute bottom-0 w-full max-w-[15px] transition-all duration-200"
                style={{
                  height,
                  borderRadius: filled ? "4px 4px 0 0" : "1px",
                  background: filled ? "var(--chart-mark)" : "var(--line-strong)",
                  opacity: dimmed ? 0.34 : 1,
                }}
                aria-hidden="true"
              />
              {index === busiest && month.count > 0 && hovered === null ? (
                <span
                  className="absolute font-mono text-[10px] tabular"
                  style={{
                    bottom: height + 5,
                    color: "var(--text-muted)",
                  }}
                  aria-hidden="true"
                >
                  {month.count}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        className="mt-2 flex items-center justify-between border-t pt-2"
        style={{ borderColor: "var(--line-subtle)" }}
      >
        <span className="label">{months[0]?.label}</span>
        <span className="label">{months[months.length - 1]?.label}</span>
      </div>

      {/* The same numbers, reachable without hovering or seeing colour. */}
      <table className="sr-only">
        <caption>Releases published per month over the last 12 months</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Releases</th>
            <th scope="col">Versions</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.key}>
              <th scope="row">{month.fullLabel}</th>
              <td>{month.count}</td>
              <td>{month.versions.join(", ") || "none"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
