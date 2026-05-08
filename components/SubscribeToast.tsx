"use client";
import { useState } from "react";

export default function SubscribeToast() {
  const [state, setState] = useState<"idle" | "open" | "success">("idle");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("success");
    setTimeout(() => setState("idle"), 3000);
    setEmail("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {state === "open" && (
        <form
          onSubmit={submit}
          className="flex items-center gap-2 rounded-[6px] border border-[#2A2420] bg-[#161310] p-3 shadow-xl"
        >
          <input
            autoFocus
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-48 rounded-[3px] border border-[#2A2420] bg-[#0C0A08] px-3 py-1.5 font-mono text-[12px] text-[#F0E8DC] placeholder-[#4A3C30] outline-none focus:border-[#D4A853]"
          />
          <button
            type="submit"
            className="rounded-[3px] bg-[#D4A853] px-3 py-1.5 font-mono text-[11px] font-medium text-[#0C0A08] hover:bg-[#C49340] transition-colors"
          >
            Subscribe
          </button>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="ml-1 font-mono text-[11px] text-[#4A3C30] hover:text-[#7A6A5A]"
          >
            ✕
          </button>
        </form>
      )}

      {state === "success" && (
        <div className="rounded-[6px] border border-[#1A3D28] bg-[#0E1F16] px-4 py-2 font-mono text-[12px] text-[#4ADE80]">
          ✓ You&apos;re subscribed
        </div>
      )}

      {state === "idle" && (
        <button
          onClick={() => setState("open")}
          className="rounded-full border border-[#2A2420] bg-[#161310] px-4 py-2 font-mono text-[11px] text-[#7A6A5A] shadow-lg transition-colors hover:border-[#D4A853] hover:text-[#D4A853]"
        >
          Subscribe to updates
        </button>
      )}
    </div>
  );
}
