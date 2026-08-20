import type { ParsedItem, SourceMode, TagType } from "./types";

/* ---------------------------------------------------------------------------
   Turning raw developer output into changelog lines.

   The parser accepts whatever is closest to hand: `git log --oneline`, full
   `git log`, a list of conventional commits, PR titles, or plain notes typed
   by a person. Everything converges on ParsedItem.
   ------------------------------------------------------------------------ */

/** Conventional-commit prefixes mapped into changelog vocabulary. */
const CONVENTIONAL_TYPES: Record<string, TagType | null> = {
  feat: "feature",
  feature: "feature",
  add: "feature",
  fix: "fix",
  bugfix: "fix",
  hotfix: "fix",
  revert: "fix",
  perf: "perf",
  performance: "perf",
  refactor: "improved",
  improve: "improved",
  improvement: "improved",
  change: "improved",
  update: "improved",
  style: "design",
  ui: "design",
  ux: "design",
  design: "design",
  a11y: "design",
  security: "security",
  sec: "security",
  docs: "docs",
  doc: "docs",
  // Housekeeping: recognised so it can be parsed, then excluded by default.
  chore: null,
  build: null,
  ci: null,
  test: null,
  tests: null,
  deps: null,
  release: null,
};

/** Prefixes that are real work but rarely belong in customer-facing notes. */
const NOISE_TYPES = new Set([
  "chore",
  "build",
  "ci",
  "test",
  "tests",
  "deps",
  "release",
]);

/** Ordered: the first pattern that matches a plain sentence wins. */
const KEYWORD_RULES: ReadonlyArray<{ type: TagType; pattern: RegExp }> = [
  {
    type: "breaking",
    pattern:
      /\b(breaking|backwards[- ]incompatible|remove[ds]? support|drop(?:ped|s)? support|no longer supported|migrat(?:e|ion) required)\b/i,
  },
  {
    type: "security",
    pattern:
      /\b(security|vulnerab|cve-|exploit|xss|csrf|sql injection|sanitiz|escape[ds]?|harden|auth bypass|leak(?:ed|s|ing)? (?:secret|token|credential))/i,
  },
  {
    type: "perf",
    pattern:
      /\b(perf(?:ormance)?|fast(?:er)?|speed(?:s|ed)? up|latency|throughput|optimi[sz]|reduce[ds]? (?:memory|bundle|time|cost)|cache|caching|lazy[- ]load|cold start)/i,
  },
  {
    type: "design",
    pattern:
      /\b(design|redesign|ui|ux|visual|layout|spacing|typograph|colou?r|contrast|icon|illustration|animation|motion|transition|hover|focus (?:ring|state)|accessib|a11y|screen reader|keyboard nav)/i,
  },
  {
    type: "fix",
    pattern:
      /\b(fix(?:e[ds])?|bug|regression|resolve[ds]?|correct(?:ed|s)?|repair|patch(?:ed|es)?|crash|broken|stale|incorrect|no longer (?:crash|throw|fail))/i,
  },
  {
    type: "feature",
    pattern:
      /\b(add(?:ed|s)?|introduc|new |ship(?:ped|s)?|launch|support for|enable[ds]?|now supports?|you can now|implement(?:ed|s)?)/i,
  },
  {
    type: "docs",
    pattern: /\b(docs?|documentation|readme|guide|tutorial|changelog|example)\b/i,
  },
  {
    type: "improved",
    pattern:
      /\b(improve|enhance|refine|polish|update[ds]?|revamp|rework|clean(?:ed)? up|simplif|clarif|better)/i,
  },
];

const CONVENTIONAL_RE =
  /^([A-Za-z][\w-]*)(?:\(([^)]*)\))?(!)?:\s*(.+)$/;
const ONELINE_HASH_RE = /^([0-9a-f]{7,40})\s+(.*)$/i;
const BULLET_RE = /^\s*(?:[-*•–—]|\d+[.)])\s+/;
const PR_RE = /\s*\(#(\d+)\)\s*$/;
const TRAILING_PR_RE = /\s*#(\d+)\s*$/;
const FULL_LOG_RE = /^commit\s+[0-9a-f]{7,40}/im;

function stripBullet(line: string) {
  return line.replace(BULLET_RE, "");
}

function toSentence(text: string) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  // Only lift the first letter when the word is not already an identifier or
  // an acronym - "iOS build" and "gRPC client" should survive untouched.
  const [first] = trimmed.split(" ");
  const looksLikeCode = /[._/]|[a-z][A-Z]|^[A-Z]{2,}$/.test(first);
  const head = looksLikeCode ? trimmed : trimmed[0].toUpperCase() + trimmed.slice(1);
  return head.replace(/\.\s*$/, "");
}

function inferType(subject: string): TagType {
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(subject)) return rule.type;
  }
  return "improved";
}

/** Collapse `git log` (non-oneline) into one subject line per commit. */
function collapseFullLog(input: string): string[] {
  const lines = input.split("\n");
  const out: string[] = [];
  let hash: string | null = null;
  let awaitingSubject = false;

  for (const line of lines) {
    const commitMatch = /^commit\s+([0-9a-f]{7,40})/i.exec(line);
    if (commitMatch) {
      hash = commitMatch[1].slice(0, 7);
      awaitingSubject = false;
      continue;
    }
    if (/^(Author|Date|Merge|AuthorDate|CommitDate):/i.test(line)) {
      awaitingSubject = true;
      continue;
    }
    const body = line.trim();
    if (!body) continue;
    if (awaitingSubject) {
      out.push(hash ? `${hash} ${body}` : body);
      awaitingSubject = false;
      hash = null;
    }
  }

  return out;
}

let counter = 0;
function nextId(seed: string) {
  counter += 1;
  return `${seed || "item"}-${counter}`;
}

/** Reset between parses so ids stay short and deterministic per run. */
function resetIds() {
  counter = 0;
}

export function parseSource(
  input: string,
  mode: SourceMode = "auto",
): ParsedItem[] {
  resetIds();
  const normalized = input.replace(/\r\n?/g, "\n");
  if (!normalized.trim()) return [];

  const useFullLog =
    mode === "gitlog" || (mode === "auto" && FULL_LOG_RE.test(normalized));

  const candidates = useFullLog
    ? collapseFullLog(normalized)
    : normalized.split("\n");

  const seen = new Set<string>();
  const items: ParsedItem[] = [];

  for (const rawLine of candidates) {
    const raw = rawLine.trim();
    if (!raw) continue;
    // Skip git metadata that survived a partial paste.
    if (/^(commit|Author|Date|Merge|diff --git|index |[+-]{3} )/i.test(raw)) {
      continue;
    }

    let working = stripBullet(raw);
    let hash: string | null = null;

    const hashMatch = ONELINE_HASH_RE.exec(working);
    // A 7+ char hex run only counts as a hash when something follows it.
    if (hashMatch && hashMatch[2].trim()) {
      hash = hashMatch[1].toLowerCase().slice(0, 7);
      working = hashMatch[2].trim();
    }

    let pr: string | null = null;
    const prMatch = PR_RE.exec(working) ?? TRAILING_PR_RE.exec(working);
    if (prMatch) {
      pr = prMatch[1];
      working = working.slice(0, prMatch.index).trim();
    }

    // Merge commits carry no useful subject of their own.
    if (/^merge (branch|pull request|remote)/i.test(working)) continue;

    let rawType: string | null = null;
    let scope: string | null = null;
    let breaking = false;
    let subject = working;

    const conventional =
      mode === "notes" ? null : CONVENTIONAL_RE.exec(working);

    if (conventional) {
      const [, type, scopeText, bang, rest] = conventional;
      const key = type.toLowerCase();
      // Only treat it as conventional when the prefix is a known type; this
      // keeps sentences like "Note: the API moved" from being mis-parsed.
      if (key in CONVENTIONAL_TYPES) {
        rawType = key;
        scope = scopeText?.trim() || null;
        breaking = Boolean(bang);
        subject = rest.trim();
      }
    }

    if (/\bBREAKING[ -]CHANGE\b/i.test(raw)) breaking = true;

    const mapped = rawType ? CONVENTIONAL_TYPES[rawType] : undefined;
    const type: TagType = breaking
      ? "breaking"
      : mapped ?? inferType(subject);

    subject = toSentence(subject);
    if (!subject) continue;

    const dedupeKey = `${type}:${subject.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    items.push({
      id: nextId(hash ?? type),
      raw,
      type,
      rawType,
      scope,
      subject,
      breaking,
      hash,
      pr,
      // Housekeeping commits are parsed but start unchecked: the author can
      // opt them back in, and nothing is silently dropped.
      included: !(rawType && NOISE_TYPES.has(rawType)),
    });
  }

  return items;
}

/** Tags present on the included items, in canonical order. */
export function tagsFromItems(items: ParsedItem[], order: readonly TagType[]) {
  const present = new Set(
    items.filter((item) => item.included).map((item) => item.type),
  );
  return order.filter((tag) => present.has(tag));
}

/**
 * A release title, proposed from the material itself: the most significant
 * item wins, since that is what a reader scans for.
 */
export function suggestTitle(items: ParsedItem[]): string {
  const included = items.filter((item) => item.included);
  if (included.length === 0) return "";

  const priority: TagType[] = [
    "breaking",
    "feature",
    "security",
    "perf",
    "design",
    "improved",
    "fix",
    "docs",
  ];

  for (const type of priority) {
    const match = included.find((item) => item.type === type);
    if (match) {
      const others = included.length - 1;
      // A headline that already fills a line carries the release on its own.
      if (others <= 0 || match.subject.length > 52) return match.subject;
      return others === 1
        ? `${match.subject}, and one more change`
        : `${match.subject}, and ${others} more changes`;
    }
  }

  return included[0].subject;
}
