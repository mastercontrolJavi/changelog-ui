import type { ComponentPropsWithoutRef, ReactElement } from "react";
import CopyButton from "@/components/CopyButton";

type CodeChild = ReactElement<{ children?: string; className?: string }>;

/** Reads the language off the `language-*` class MDX puts on the inner code. */
function languageOf(child: unknown): string | null {
  const className = (child as CodeChild)?.props?.className ?? "";
  const match = /language-([\w-]+)/.exec(className);
  return match ? match[1] : null;
}

export default function CodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const raw =
    typeof children === "string"
      ? children
      : (children as CodeChild)?.props?.children ?? "";
  const language = languageOf(children);

  return (
    <div className="group relative">
      {language ? (
        <span
          className="label pointer-events-none absolute left-4 top-[-7px] px-1.5"
          style={{
            background: "var(--surface-base)",
            color: "var(--text-faint)",
          }}
        >
          {language}
        </span>
      ) : null}
      <div className="absolute right-2.5 top-2.5 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        <CopyButton text={String(raw).trimEnd()} label="copy" />
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}
