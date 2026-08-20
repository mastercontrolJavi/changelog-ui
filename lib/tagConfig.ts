import type { TagType } from "./types";

export const tagOrder = [
  "feature",
  "improved",
  "fix",
  "perf",
  "design",
  "breaking",
  "security",
  "docs",
] as const satisfies readonly TagType[];

type TagMeta = {
  label: string;
  /** One-line explanation, used in the filter tooltip and the studio legend. */
  blurb: string;
  /** Heading this tag contributes under Keep a Changelog conventions. */
  section: string;
  /** How much this tag pushes a semver bump. */
  weight: 0 | 1 | 2;
};

export const tagConfig = {
  feature: {
    label: "feature",
    blurb: "Something you could not do before",
    section: "Added",
    weight: 1,
  },
  improved: {
    label: "improved",
    blurb: "Existing behaviour, made better",
    section: "Changed",
    weight: 0,
  },
  fix: {
    label: "fix",
    blurb: "A defect corrected",
    section: "Fixed",
    weight: 0,
  },
  perf: {
    label: "perf",
    blurb: "Same result, less time or memory",
    section: "Performance",
    weight: 0,
  },
  design: {
    label: "design",
    blurb: "Interface, interaction, or visual craft",
    section: "Design",
    weight: 0,
  },
  breaking: {
    label: "breaking",
    blurb: "Requires action before upgrading",
    section: "Breaking changes",
    weight: 2,
  },
  security: {
    label: "security",
    blurb: "Hardening or a disclosed vulnerability",
    section: "Security",
    weight: 1,
  },
  docs: {
    label: "docs",
    blurb: "Documentation and examples",
    section: "Documentation",
    weight: 0,
  },
} as const satisfies Record<TagType, TagMeta>;

/** Inline CSS variables so a tag chip re-colours itself with the theme. */
export function tagVars(tag: TagType) {
  return {
    "--tag-fg": `var(--tag-${tag}-fg)`,
    "--tag-bg": `var(--tag-${tag}-bg)`,
    "--tag-line": `var(--tag-${tag}-line)`,
  } as React.CSSProperties;
}

export function isTagType(value: string): value is TagType {
  return (tagOrder as readonly string[]).includes(value);
}

export function parseFiltersFromParam(value: string | null): TagType[] {
  if (!value) return [];
  const selected = new Set(
    value
      .split(",")
      .map((tag) => tag.trim())
      .filter(isTagType),
  );
  return tagOrder.filter((tag) => selected.has(tag));
}
