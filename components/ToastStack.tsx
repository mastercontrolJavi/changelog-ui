"use client";

import { useApp } from "@/components/providers/AppProvider";

export default function ToastStack() {
  const { toasts } = useApp();

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-1/2 z-[95] flex -translate-x-1/2 flex-col items-center gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className="toast flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11.5px]"
          style={{
            borderColor:
              item.tone === "success" ? "var(--accent-line)" : "var(--line)",
            background: "var(--surface-overlay)",
            color:
              item.tone === "success" ? "var(--accent)" : "var(--text-secondary)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {item.tone === "success" ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8.5l3.2 3.2L13 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
          {item.message}
        </div>
      ))}
    </div>
  );
}
