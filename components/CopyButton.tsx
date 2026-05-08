"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      aria-label="Copy code"
      className="absolute right-3 top-3 flex items-center gap-1.5 rounded-[3px] border border-[#2A2420] bg-[#161310] px-2 py-1 font-mono text-[10px] text-[#7A6A5A] opacity-0 transition-all group-hover:opacity-100 hover:border-[#3D342C] hover:text-[#F0E8DC]"
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l4 4 6-7" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          copy
        </>
      )}
    </button>
  );
}
