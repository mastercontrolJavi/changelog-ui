import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import CodeBlock from "@/components/CodeBlock";

const components: NonNullable<MDXRemoteProps["components"]> = {
  pre: CodeBlock,
  a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        {...props}
      />
    );
  },
};

/** Server-rendered entry prose. Handed to the client feed as a slot so MDX
 *  never has to cross into the browser bundle. */
export default function MdxBody({ source }: { source: string }) {
  return (
    <div className="changelog-prose">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
