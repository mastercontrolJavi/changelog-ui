import CopyButton from "./CopyButton";
import type { ComponentPropsWithoutRef } from "react";

export default function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const rawText =
    typeof children === "string"
      ? children
      : (children as any)?.props?.children ?? "";

  return (
    <pre {...props} className="group relative">
      <CopyButton text={String(rawText).trimEnd()} />
      {children}
    </pre>
  );
}
