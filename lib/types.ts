/** The vocabulary a release note is written in. */
export type TagType =
  | "feature"
  | "improved"
  | "fix"
  | "perf"
  | "design"
  | "breaking"
  | "security"
  | "docs";

export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  tags: TagType[];
  content: string;
  highlight?: boolean;
}

/** One line of source material after parsing. */
export interface ParsedItem {
  id: string;
  /** The original line, kept so the UI can show what it came from. */
  raw: string;
  /** Normalized changelog vocabulary. */
  type: TagType;
  /** The conventional-commit prefix, when the line had one (feat, fix, perf…). */
  rawType: string | null;
  scope: string | null;
  subject: string;
  breaking: boolean;
  hash: string | null;
  pr: string | null;
  /** Excluded lines stay visible but are dropped from the output. */
  included: boolean;
}

export type Audience = "engineering" | "product" | "design" | "summary";

export type ExportFormat =
  | "markdown"
  | "mdx"
  | "json"
  | "html"
  | "slack"
  | "text"
  | "entries";

export type SourceMode = "auto" | "gitlog" | "commits" | "notes";

export interface ReleaseDraft {
  version: string;
  date: string;
  title: string;
  summary: string;
  tags: TagType[];
  highlight: boolean;
  audience: Audience;
  items: ParsedItem[];
}
