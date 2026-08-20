"use client";

import { useState } from "react";
import Link from "next/link";
import Colophon from "@/components/Colophon";
import { useApp } from "@/components/providers/AppProvider";

export default function SiteFooter() {
  const { toast, setShortcutsOpen } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
    window.setTimeout(() => setSent(false), 6000);
  };

  const copyFeed = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/rss`);
      toast("Feed URL copied", "success");
    } catch {
      toast("Could not reach the clipboard");
    }
  };

  return (
    <footer className="mt-20">
      <div className="shell">
        <hr className="rule" />

        <section className="py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-[38ch]">
              <p className="label" style={{ color: "var(--accent)" }}>
                Stay current
              </p>
              <h2
                className="mt-2 font-display text-[24px] leading-tight"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                Every release, when it ships
              </h2>
              <p
                className="mt-2 font-sans text-[14px] leading-[1.68]"
                style={{ color: "var(--text-muted)" }}
              >
                The RSS feed is live and real. The email field is part of the
                demo - nothing is stored or sent.
              </p>
            </div>

            <div className="flex w-full max-w-[320px] flex-col gap-2">
              <form onSubmit={submit} className="flex gap-2">
                <label className="sr-only" htmlFor="subscribe-email">
                  Email address
                </label>
                <input
                  id="subscribe-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="field"
                  style={{ height: 34 }}
                />
                <button type="submit" className="btn btn-primary shrink-0">
                  Subscribe
                </button>
              </form>

              {sent ? (
                <p
                  className="font-mono text-[11px] leading-5"
                  style={{ color: "var(--tag-feature-fg)" }}
                  role="status"
                >
                  ✓ Demo only - no email was captured. Use RSS for real updates.
                </p>
              ) : null}

              <div className="flex gap-2">
                <a href="/rss" className="btn btn-sm flex-1">
                  RSS feed
                </a>
                <button type="button" onClick={copyFeed} className="btn btn-sm flex-1">
                  Copy feed URL
                </button>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 py-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Colophon />
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="font-mono text-[11px]"
              style={{ color: "var(--text-faint)" }}
            >
              Shortcuts <kbd className="kbd ml-1">?</kbd>
            </button>
            <Link
              href="/studio"
              className="font-mono text-[11px]"
              style={{ color: "var(--text-faint)" }}
            >
              Studio
            </Link>
          </div>

          <a
            href="https://javiertpadilla.com"
            className="font-mono text-[11px]"
            style={{ color: "var(--text-faint)" }}
          >
            javiertpadilla.com
          </a>
        </div>
      </div>
    </footer>
  );
}
