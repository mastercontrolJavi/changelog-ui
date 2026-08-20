"use client";
import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
  /** Announced and shown on success. */
  doneLabel?: string;
};

export default function CopyButton({
  text,
  label = "copy",
  doneLabel = "copied",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked (insecure context or denied permission). */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? doneLabel : `Copy ${label}`}
      className={`btn btn-sm ${className}`}
      style={copied ? { color: "var(--tag-feature-fg)", borderColor: "var(--tag-feature-line)" } : undefined}
    >
      {copied ? (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8.5l3.2 3.2L13 5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="5.2" y="5.2" width="8.6" height="8.6" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M10.8 5.2V3.8A1.6 1.6 0 0 0 9.2 2.2H3.8A1.6 1.6 0 0 0 2.2 3.8v5.4a1.6 1.6 0 0 0 1.6 1.6h1.4"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      )}
      {copied ? doneLabel : label}
    </button>
  );
}
