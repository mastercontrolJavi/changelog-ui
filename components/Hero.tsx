import Link from "next/link";
import ReleaseRhythm from "@/components/ReleaseRhythm";
import { relativeDays, type ActivityMonth, type FeedStats } from "@/lib/format";

type HeroProps = {
  stats: FeedStats;
  latestId: string;
  activity: ActivityMonth[];
  /** Passed in so the server renders one consistent "now". */
  now: Date;
};

function Stat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  // dt first, dd second keeps the markup valid; the reversed column puts the
  // number on top where the eye lands first.
  return (
    <div className="flex min-w-0 flex-col-reverse gap-1.5">
      <dt className="label truncate">{label}</dt>
      <dd
        className="font-display tabular m-0 text-[clamp(20px,3.4vw,27px)] leading-none"
        style={{
          color: accent ? "var(--accent)" : "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </dd>
    </div>
  );
}

export default function Hero({ stats, latestId, activity, now }: HeroProps) {
  return (
    <section className="relative overflow-hidden pb-6 pt-14 sm:pt-20">
      <div className="aurora" aria-hidden="true" />
      <div className="grid-stock" aria-hidden="true" />

      <div className="shell">
        {/* Broadsheet dateline */}
        <div
          className="rise flex flex-wrap items-center gap-x-3 gap-y-2 pb-5"
          style={{ ["--i" as string]: 0 }}
        >
          <span className="label" style={{ color: "var(--accent)" }}>
            Release notes
          </span>
          <span aria-hidden="true" className="h-px w-6" style={{ background: "var(--line)" }} />
          <span className="label">{stats.spanLabel}</span>
          <span aria-hidden="true" className="h-px w-6" style={{ background: "var(--line)" }} />
          <span className="label">Issue {String(stats.releases).padStart(3, "0")}</span>
        </div>

        <hr className="rule" />

        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <h1 className="masthead rise pt-7" style={{ ["--i" as string]: 1 }}>
            Changelog
            <br />
            <em className="foil">Studio</em>
          </h1>

          <div
            className="rise hidden pb-3 lg:block"
            style={{ ["--i" as string]: 2 }}
          >
            <ReleaseRhythm months={activity} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="rise max-w-[46ch] font-sans text-[17px] leading-[1.62]"
            style={{ ["--i" as string]: 3, color: "var(--text-muted)" }}
          >
            Read what shipped, then write the next one. The feed below is a
            production changelog. The{" "}
            <Link
              href="/studio"
              style={{
                color: "var(--text-primary)",
                textDecoration: "underline",
                textDecorationColor: "var(--accent-line)",
                textUnderlineOffset: "4px",
              }}
            >
              studio
            </Link>{" "}
            turns a git log into one, in whichever voice the reader needs.
          </p>

          <div
            className="rise flex flex-wrap items-center gap-2"
            style={{ ["--i" as string]: 4 }}
          >
            <Link href="/studio" className="btn btn-primary">
              Open the Studio
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h9m0 0L8.4 4.4M12 8l-3.6 3.6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href={`#${latestId}`} className="btn">
              Latest release
            </Link>
          </div>
        </div>

        <hr className="rule mt-9" />

        <dl
          className="rise grid grid-cols-2 gap-y-7 py-6 sm:grid-cols-4"
          style={{ ["--i" as string]: 5 }}
        >
          <Stat value={String(stats.releases)} label="Releases published" />
          <Stat value={stats.latestVersion} label="Latest version" accent />
          <Stat
            value={stats.cadenceDays ? `${stats.cadenceDays}d` : "--"}
            label="Median cadence"
          />
          <Stat
            value={relativeDays(stats.latestDate, now)}
            label="Last shipped"
          />
        </dl>

        <hr className="rule" />
      </div>
    </section>
  );
}
