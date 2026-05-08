import type { ComponentPropsWithoutRef } from "react";
import { format, parseISO } from "date-fns";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import TagBadge from "@/components/TagBadge";
import CodeBlock from "@/components/CodeBlock";
import type { ChangelogEntry as ChangelogEntryType } from "@/lib/types";

type ChangelogEntryProps = {
  entry: ChangelogEntryType;
};

const mdxComponents: NonNullable<MDXRemoteProps["components"]> = {
  pre: CodeBlock,
  a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
    const isExternal = href?.startsWith("http");

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        {...props}
      />
    );
  },
};

export default async function ChangelogEntry({ entry }: ChangelogEntryProps) {
  const formattedDate = format(parseISO(entry.date), "MMM d, yyyy");
  const articleClassName = entry.highlight
    ? "rounded-[6px] border border-[#2A2420] border-l-2 border-l-[#D4A853] bg-[#0E0C09] p-6"
    : "";

  return (
    <article id={entry.id} className={articleClassName}>
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[12px] leading-5 text-[#7A6A5A]">
          {entry.version}
        </p>
        <time
          dateTime={entry.date}
          className="shrink-0 font-mono text-[12px] leading-5 text-[#4A3C30]"
        >
          {formattedDate}
        </time>
      </div>

      <h2 className="entry-title my-0 mt-[6px] font-display text-[22px] font-normal leading-[1.25] text-[#F0E8DC]">
        <a
          href={`#${entry.id}`}
          className="entry-anchor inline-flex items-baseline gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A853]"
          aria-label={`${entry.title} permalink`}
        >
          <span>{entry.title}</span>
          <span className="anchor-mark font-mono text-[13px]" aria-hidden="true">
            #
          </span>
        </a>
      </h2>

      <div className="mt-[10px] flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      <div className="changelog-prose">
        <MDXRemote source={entry.content} components={mdxComponents} />
      </div>
    </article>
  );
}
