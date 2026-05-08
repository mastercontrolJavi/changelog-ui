"use client";
import { useState } from "react";

export default function AboutBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-1.5 rounded-full border border-[#2A2420] bg-[#161310] px-3 py-1.5 font-mono text-[11px] text-[#4A3C30] shadow-lg transition-colors hover:border-[#3D342C] hover:text-[#7A6A5A]"
        aria-label="About this project"
      >
        <span className="text-[10px]">?</span>
        about
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-start p-6 sm:items-center sm:justify-start sm:pl-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[8px] border border-[#2A2420] bg-[#161310] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#4A3C30]">
                Portfolio project
              </p>
              <button
                onClick={() => setOpen(false)}
                className="font-mono text-[11px] text-[#4A3C30] hover:text-[#7A6A5A]"
              >
                ✕
              </button>
            </div>

            <h2 className="mb-3 font-display text-[18px] font-normal text-[#F0E8DC]">
              Changelog UI
            </h2>

            <p className="mb-4 font-sans text-[13px] leading-[1.7] text-[#7A6A5A]">
              A polished changelog interface built to demonstrate Design Engineer
              thinking. Companies like Supabase, Vercel, and Linear ship surfaces
              exactly like this — release notes that are readable, filterable, and
              feel considered.
            </p>

            <p className="mb-5 font-sans text-[13px] leading-[1.7] text-[#7A6A5A]">
              This project focuses on typography hierarchy, tag filtering with
              URL-synced state, MDX content rendering, keyboard navigation (try{" "}
              <kbd className="rounded-[3px] border border-[#2A2420] bg-[#0C0A08] px-1.5 py-0.5 font-mono text-[11px] text-[#D4A853]">
                j
              </kbd>{" "}
              /{" "}
              <kbd className="rounded-[3px] border border-[#2A2420] bg-[#0C0A08] px-1.5 py-0.5 font-mono text-[11px] text-[#D4A853]">
                k
              </kbd>
              ), and copy-on-code-blocks — the small details that separate a
              template from a shipped product.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Next.js 14", "TypeScript", "Tailwind v4", "MDX", "App Router"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-[3px] border border-[#2A2420] px-2 py-0.5 font-mono text-[10px] text-[#4A3C30]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 border-t border-[#1E1916] pt-4">
              <a
                href="https://javiertpadilla.com"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-[#D4A853] hover:underline"
              >
                javiertpadilla.com →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
