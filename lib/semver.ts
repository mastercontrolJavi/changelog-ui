import { tagConfig } from "./tagConfig";
import type { ParsedItem, TagType } from "./types";

export type Bump = "major" | "minor" | "patch";

export interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
  prefix: string;
}

const VERSION_RE = /^(v?)(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

export function parseVersion(value: string): Version | null {
  const match = VERSION_RE.exec(value.trim());
  if (!match) return null;
  return {
    prefix: match[1],
    major: Number(match[2]),
    minor: Number(match[3]),
    patch: Number(match[4]),
    prerelease: match[5] ?? null,
  };
}

export function formatVersion(version: Version): string {
  const core = `${version.prefix}${version.major}.${version.minor}.${version.patch}`;
  return version.prerelease ? `${core}-${version.prerelease}` : core;
}

export function applyBump(value: string, bump: Bump): string {
  const version = parseVersion(value);
  if (!version) return value;

  // A prerelease promotes to its own core version before bumping further.
  const base: Version = { ...version, prerelease: null };

  if (bump === "major") {
    return formatVersion({ ...base, major: base.major + 1, minor: 0, patch: 0 });
  }
  if (bump === "minor") {
    return formatVersion({ ...base, minor: base.minor + 1, patch: 0 });
  }
  return formatVersion({ ...base, patch: base.patch + 1 });
}

/**
 * The bump the material justifies. Breaking changes force a major, anything
 * additive forces a minor, everything else is a patch - the rule every
 * semver-literate reader already expects.
 */
export function inferBump(items: ParsedItem[]): Bump {
  let weight: 0 | 1 | 2 = 0;

  for (const item of items) {
    if (!item.included) continue;
    if (item.breaking) return "major";
    const itemWeight = tagConfig[item.type].weight;
    if (itemWeight > weight) weight = itemWeight;
  }

  if (weight === 2) return "major";
  return weight === 1 ? "minor" : "patch";
}

export function bumpReason(items: ParsedItem[], bump: Bump): string {
  const included = items.filter((item) => item.included);
  if (bump === "major") {
    const count = included.filter(
      (item) => item.breaking || item.type === "breaking",
    ).length;
    return `${count} breaking change${count === 1 ? "" : "s"} in this set`;
  }
  if (bump === "minor") {
    const additive: TagType[] = ["feature", "security"];
    const count = included.filter((item) => additive.includes(item.type)).length;
    return `${count} additive change${count === 1 ? "" : "s"}, nothing breaking`;
  }
  return "Fixes and refinements only";
}

/** A stable, URL-safe anchor for a version string. */
export function versionSlug(version: string): string {
  const slug = version
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "release";
}
