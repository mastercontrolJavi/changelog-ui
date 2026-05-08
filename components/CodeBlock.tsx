import CopyButton from "./CopyButton";
import type { ComponentPropsWithoutRef, ReactElement } from "react";

export default function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const rawText =
    typeof children === "string"
      ? children
      : (children as ReactElement<{ children?: string }>)?.props?.children ?? "";

  return (
    <pre {...props} className="group relative">
      <CopyButton text={String(rawText).trimEnd()} />
      {children}
    </pre>
  );
}
