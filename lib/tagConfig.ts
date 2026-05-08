import type { TagType } from "./types";

export const tagOrder = [
  "feature",
  "fix",
  "breaking",
  "improved",
  "security",
] as const satisfies readonly TagType[];

export const tagConfig = {
  feature: {
    label: "feature",
    background: "#0E1F16",
    color: "#4ADE80",
    border: "#1A3D28",
  },
  fix: {
    label: "fix",
    background: "#1A1020",
    color: "#A78BFA",
    border: "#2D1F40",
  },
  breaking: {
    label: "breaking",
    background: "#1F0E0E",
    color: "#F87171",
    border: "#3D1A1A",
  },
  improved: {
    label: "improved",
    background: "#0E1620",
    color: "#60A5FA",
    border: "#1A2D40",
  },
  security: {
    label: "security",
    background: "#1A1508",
    color: "#FBBF24",
    border: "#3D3010",
  },
} as const satisfies Record<
  TagType,
  {
    label: string;
    background: string;
    color: string;
    border: string;
  }
>;
