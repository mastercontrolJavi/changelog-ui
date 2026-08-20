import type { Audience, ParsedItem, TagType } from "./types";

/* ---------------------------------------------------------------------------
   Voice presets.

   The same set of commits has to serve four readers who want different things.
   An engineer wants the scope and the SHA. A PM wants the outcome. A designer
   wants the interface work surfaced first. A stakeholder wants five lines.

   Every transform here is deterministic and reversible in the UI: nothing is
   invented, only reordered, relabelled, or reworded from a fixed vocabulary.
   ------------------------------------------------------------------------ */

/** Imperative commit mood to third person, for reader-facing voices. */
const THIRD_PERSON: Record<string, string> = {
  add: "Adds",
  added: "Adds",
  align: "Aligns",
  aligned: "Aligns",
  allow: "Allows",
  allowed: "Allows",
  avoid: "Avoids",
  bring: "Brings",
  cache: "Caches",
  cached: "Caches",
  cap: "Caps",
  capped: "Caps",
  collapse: "Collapses",
  collapsed: "Collapses",
  correct: "Corrects",
  corrected: "Corrects",
  defer: "Defers",
  deferred: "Defers",
  delete: "Deletes",
  deleted: "Deletes",
  deprecate: "Deprecates",
  deprecated: "Deprecates",
  disable: "Disables",
  disabled: "Disables",
  document: "Documents",
  documented: "Documents",
  drop: "Drops",
  dropped: "Drops",
  enable: "Enables",
  enabled: "Enables",
  expand: "Expands",
  expanded: "Expands",
  expose: "Exposes",
  exposed: "Exposes",
  extend: "Extends",
  extended: "Extends",
  fix: "Fixes",
  fixed: "Fixes",
  handle: "Handles",
  handled: "Handles",
  harden: "Hardens",
  hardened: "Hardens",
  implement: "Adds",
  implemented: "Adds",
  improve: "Improves",
  improved: "Improves",
  introduce: "Introduces",
  introduced: "Introduces",
  make: "Makes",
  made: "Makes",
  merge: "Merges",
  merged: "Merges",
  migrate: "Migrates",
  migrated: "Migrates",
  polish: "Polishes",
  polished: "Polishes",
  prevent: "Prevents",
  prevented: "Prevents",
  normalize: "Normalizes",
  normalized: "Normalizes",
  paginate: "Paginates",
  preload: "Preloads",
  redesign: "Redesigns",
  redesigned: "Redesigns",
  refresh: "Refreshes",
  refreshed: "Refreshes",
  remove: "Removes",
  removed: "Removes",
  reduce: "Reduces",
  reduced: "Reduces",
  refactor: "Reworks",
  refactored: "Reworks",
  rename: "Renames",
  renamed: "Renames",
  replace: "Replaces",
  replaced: "Replaces",
  resolve: "Resolves",
  resolved: "Resolves",
  reset: "Resets",
  restore: "Restores",
  restored: "Restores",
  retune: "Retunes",
  retuned: "Retunes",
  rotate: "Rotates",
  rotated: "Rotates",
  rework: "Reworks",
  reworked: "Reworks",
  sanitize: "Sanitizes",
  sanitized: "Sanitizes",
  ship: "Ships",
  shipped: "Ships",
  shorten: "Shortens",
  shortened: "Shortens",
  show: "Shows",
  showed: "Shows",
  simplify: "Simplifies",
  simplified: "Simplifies",
  split: "Splits",
  stop: "Stops",
  stopped: "Stops",
  surface: "Surfaces",
  surfaced: "Surfaces",
  sync: "Syncs",
  synced: "Syncs",
  track: "Tracks",
  tracked: "Tracks",
  support: "Supports",
  supported: "Supports",
  tighten: "Tightens",
  tightened: "Tightens",
  unify: "Unifies",
  unified: "Unifies",
  update: "Updates",
  updated: "Updates",
  validate: "Validates",
  validated: "Validates",
  verify: "Verifies",
  verified: "Verifies",
};

/* Several dictionary entries double as nouns ("cache invalidation is broken",
   "reset tokens are single-use"). When the leading word is followed by a
   linking verb the sentence is already in third person, so leave it alone. */
const ALREADY_THIRD_PERSON = /^\w+\s+\w*\s*\b(is|are|was|were|no longer|now)\b/i;

/** Shorthand an engineer reads fluently and nobody else does. */
const EXPANSIONS: ReadonlyArray<[RegExp, string]> = [
  [/\ba11y\b/gi, "accessibility"],
  [/\bi18n\b/gi, "internationalization"],
  [/\bl10n\b/gi, "localization"],
  [/\bauthn?\b/gi, "authentication"],
  [/\bauthz\b/gi, "authorization"],
  [/\bconfigs\b/gi, "configurations"],
  [/\bconfig\b/gi, "configuration"],
  [/\bdeps\b/gi, "dependencies"],
  [/\benvs\b/gi, "environments"],
  [/\benv\b/gi, "environment"],
  [/\bperf\b/gi, "performance"],
  [/\brepos\b/gi, "repositories"],
  [/\brepo\b/gi, "repository"],
  [/\bssr\b/gi, "server-side rendering"],
  [/\be2e\b/gi, "end-to-end"],
  [/\bregex\b/gi, "pattern matching"],
];

function expandJargon(text: string) {
  let out = text;
  for (const [pattern, replacement] of EXPANSIONS) {
    out = out.replace(pattern, (match) =>
      /^[A-Z]/.test(match)
        ? replacement[0].toUpperCase() + replacement.slice(1)
        : replacement,
    );
  }
  return out;
}

function toThirdPerson(text: string) {
  if (ALREADY_THIRD_PERSON.test(text)) return text;
  const match = /^(\w+)(\b[\s\S]*)$/.exec(text);
  if (!match) return text;

  const replacement = THIRD_PERSON[match[1].toLowerCase()];
  if (!replacement) return text;

  // "Rotate keys and shorten sessions" needs both verbs moved, or the line
  // ends up half-converted and reads worse than leaving it alone.
  const rest = match[2].replace(
    /(\band\s+)(\w+)/,
    (whole, conjunction: string, verb: string) => {
      const paired = THIRD_PERSON[verb.toLowerCase()];
      return paired ? `${conjunction}${paired.toLowerCase()}` : whole;
    },
  );

  return `${replacement}${rest}`;
}

/** Reference suffix, e.g. ` (#412, a1b2c3d)`. */
export function refSuffix(item: ParsedItem, showHash: boolean) {
  const parts: string[] = [];
  if (item.pr) parts.push(`#${item.pr}`);
  if (showHash && item.hash) parts.push(`\`${item.hash}\``);
  return parts.length ? ` (${parts.join(", ")})` : "";
}

export interface VoicePreset {
  id: Audience;
  label: string;
  /** Who this voice is written for. */
  reader: string;
  blurb: string;
  /** Section heading per tag. */
  headings: Partial<Record<TagType, string>>;
  /** Tags folded into another bucket for this voice. */
  fold: Partial<Record<TagType, TagType>>;
  /** Section order. Tags missing from this list are dropped entirely. */
  order: TagType[];
  showScope: boolean;
  showHash: boolean;
  showPr: boolean;
  /** Cap per section; the remainder collapses into a count line. */
  cap: number | null;
  /** Rewrites a single line's subject. */
  line: (item: ParsedItem) => string;
  /** Opening sentence, given counts. */
  lead: (context: { total: number; breaking: number; version: string }) => string;
}

const engineering: VoicePreset = {
  id: "engineering",
  label: "Engineering",
  reader: "The people who will upgrade",
  blurb: "Scopes, SHAs, and PR refs kept. Grouped Keep a Changelog style.",
  headings: {
    breaking: "Breaking changes",
    security: "Security",
    feature: "Added",
    perf: "Performance",
    improved: "Changed",
    fix: "Fixed",
    design: "Interface",
    docs: "Documentation",
  },
  fold: {},
  order: [
    "breaking",
    "security",
    "feature",
    "perf",
    "improved",
    "fix",
    "design",
    "docs",
  ],
  showScope: true,
  showHash: true,
  showPr: true,
  cap: null,
  line: (item) => item.subject,
  lead: ({ total, breaking, version }) =>
    breaking > 0
      ? `${version} contains ${breaking} breaking change${
          breaking === 1 ? "" : "s"
        } across ${total} commit${total === 1 ? "" : "s"}. Read the upgrade notes before deploying.`
      : `${total} change${total === 1 ? "" : "s"} in ${version}. No migration required.`,
};

const product: VoicePreset = {
  id: "product",
  label: "Product",
  reader: "Customers and the people who talk to them",
  blurb: "Outcome-first wording, jargon expanded, internal refs stripped.",
  headings: {
    breaking: "Before you upgrade",
    feature: "What's new",
    improved: "Improvements",
    fix: "Fixes",
    security: "Security",
    design: "Interface",
  },
  fold: { perf: "improved", docs: "improved" },
  order: ["breaking", "feature", "improved", "fix", "security", "design"],
  showScope: false,
  showHash: false,
  showPr: false,
  cap: null,
  line: (item) => toThirdPerson(expandJargon(item.subject)),
  lead: ({ total, breaking, version }) =>
    breaking > 0
      ? `${version} brings ${total} update${
          total === 1 ? "" : "s"
        }, including ${breaking} that need${breaking === 1 ? "s" : ""} a change on your side.`
      : `${version} brings ${total} update${total === 1 ? "" : "s"} to the product.`,
};

const design: VoicePreset = {
  id: "design",
  label: "Design",
  reader: "Designers reviewing what shipped",
  blurb: "Interface and accessibility work leads. Engineering detail follows.",
  headings: {
    design: "Interface & interaction",
    feature: "New surfaces",
    improved: "Refinements",
    fix: "Visual fixes",
    breaking: "Changes to existing patterns",
    perf: "Responsiveness",
    security: "Security",
  },
  fold: { docs: "improved" },
  order: [
    "design",
    "feature",
    "improved",
    "fix",
    "perf",
    "breaking",
    "security",
  ],
  showScope: true,
  showHash: false,
  showPr: true,
  cap: null,
  line: (item) => expandJargon(item.subject),
  lead: ({ total, version }) =>
    `${total} change${
      total === 1 ? "" : "s"
    } in ${version}. Interface work is listed first; everything below it changes behaviour without changing the surface.`,
};

const summary: VoicePreset = {
  id: "summary",
  label: "Summary",
  reader: "Anyone reading between meetings",
  blurb: "Only what moves the needle, capped at three lines per section.",
  headings: {
    breaking: "Needs attention",
    feature: "Highlights",
    security: "Security",
  },
  fold: { perf: "feature", improved: "feature", design: "feature", fix: "feature", docs: "feature" },
  order: ["breaking", "feature", "security"],
  showScope: false,
  showHash: false,
  showPr: false,
  cap: 3,
  line: (item) => toThirdPerson(expandJargon(item.subject)),
  lead: ({ total, version }) =>
    `${version} - ${total} change${total === 1 ? "" : "s"} shipped.`,
};

export const voices: Record<Audience, VoicePreset> = {
  engineering,
  product,
  design,
  summary,
};

export const voiceOrder: Audience[] = [
  "engineering",
  "product",
  "design",
  "summary",
];

/** Renders one item into a bullet for a given voice. */
export function renderLine(item: ParsedItem, voice: VoicePreset): string {
  const body = voice.line(item);
  const scope = voice.showScope && item.scope ? `**${item.scope}** - ` : "";
  const refs = refSuffix(
    { ...item, pr: voice.showPr ? item.pr : null },
    voice.showHash,
  );
  return `${scope}${body}${refs}`;
}

export interface VoiceSection {
  tag: TagType;
  heading: string;
  items: ParsedItem[];
  /** Items beyond the voice's cap, reported as a count instead of listed. */
  overflow: number;
}

/** Groups included items into the sections this voice publishes. */
export function buildSections(
  items: ParsedItem[],
  voice: VoicePreset,
): VoiceSection[] {
  const buckets = new Map<TagType, ParsedItem[]>();

  for (const item of items) {
    if (!item.included) continue;
    const target = voice.fold[item.type] ?? item.type;
    if (!voice.order.includes(target)) continue;
    const bucket = buckets.get(target);
    if (bucket) bucket.push(item);
    else buckets.set(target, [item]);
  }

  return voice.order.flatMap((tag) => {
    const bucket = buckets.get(tag);
    if (!bucket || bucket.length === 0) return [];
    const capped = voice.cap ? bucket.slice(0, voice.cap) : bucket;
    return [
      {
        tag,
        heading: voice.headings[tag] ?? tag,
        items: capped,
        overflow: bucket.length - capped.length,
      },
    ];
  });
}
