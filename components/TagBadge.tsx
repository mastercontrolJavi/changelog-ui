import { tagConfig, tagVars } from "@/lib/tagConfig";
import type { TagType } from "@/lib/types";

type TagBadgeProps = {
  tag: TagType;
  /** Shows the colour dot; useful when several tags sit in a row. */
  dot?: boolean;
  title?: string;
};

export default function TagBadge({ tag, dot = true, title }: TagBadgeProps) {
  const config = tagConfig[tag];

  return (
    <span
      className="tag"
      style={tagVars(tag)}
      title={title ?? config.blurb}
    >
      {dot ? <span className="tag-dot" aria-hidden="true" /> : null}
      {config.label}
    </span>
  );
}
