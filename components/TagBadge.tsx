import type { CSSProperties } from "react";
import { tagConfig } from "@/lib/tagConfig";
import type { TagType } from "@/lib/types";

type TagBadgeProps = {
  tag: TagType;
  size?: "sm" | "md";
};

export default function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
  const config = tagConfig[tag];
  const padding = size === "md" ? "4px 10px" : "2px 8px";

  return (
    <span
      className="inline-flex items-center rounded-[3px] border font-mono text-[11px] font-medium leading-[16px]"
      style={
        {
          backgroundColor: config.background,
          borderColor: config.border,
          color: config.color,
          padding,
        } satisfies CSSProperties
      }
    >
      {config.label}
    </span>
  );
}
