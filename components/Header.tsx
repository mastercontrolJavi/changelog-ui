"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

const NAV = [
  { href: "/", label: "Releases" },
  { href: "/studio", label: "Studio" },
];

function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollTop > 8);
      setProgress(height > 0 ? Math.min(1, scrollTop / height) : 0);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { scrolled, progress };
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2L3.1 3.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.4 9.9A5.8 5.8 0 0 1 6.1 2.6a5.9 5.9 0 1 0 7.3 7.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { scrolled, progress } = useScrollState();
  const { theme, toggleTheme, setPaletteOpen } = useApp();
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="shell flex h-[60px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href="/"
            className="mr-2 flex shrink-0 items-center gap-2"
            aria-label="Changelog Studio, home"
          >
            <span
              aria-hidden="true"
              className="grid h-[22px] w-[22px] place-items-center rounded-[5px]"
              style={{
                background:
                  "linear-gradient(160deg, var(--accent-strong), var(--accent-deep))",
                boxShadow: "var(--foil-glow)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="2" y="3.2" width="12" height="1.9" rx="0.95" fill="var(--accent-contrast)" />
                <rect x="2" y="7.05" width="8.5" height="1.9" rx="0.95" fill="var(--accent-contrast)" opacity="0.62" />
                <rect x="2" y="10.9" width="5" height="1.9" rx="0.95" fill="var(--accent-contrast)" opacity="0.34" />
              </svg>
            </span>
            <span
              className="hidden font-display text-[16px] italic sm:block"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
            >
              Changelog
            </span>
          </Link>

          <nav aria-label="Sections" className="flex items-center gap-0.5">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="relative rounded-[6px] px-2.5 py-1.5 font-mono text-[11.5px] transition-colors"
                  style={{
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    background: active ? "var(--surface-raised)" : "transparent",
                  }}
                >
                  {item.label}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2.5 -bottom-[1px] h-[2px] rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="btn btn-sm hidden sm:inline-flex"
            aria-label="Open the command bar"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7.2" cy="7.2" r="4.4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ color: "var(--text-faint)" }}>Search</span>
            <kbd className="kbd ml-1">{mac ? "⌘" : "Ctrl"}</kbd>
            <kbd className="kbd">K</kbd>
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="btn btn-sm sm:hidden"
            aria-label="Open the command bar"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7.2" cy="7.2" r="4.4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-sm"
            aria-label={`Switch to ${theme === "dark" ? "newsprint" : "ink"} stock`}
            title={`Switch stock  ·  T`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <a
            href="/rss"
            className="btn btn-sm hidden md:inline-flex"
            aria-label="Subscribe via RSS"
            title="RSS"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="3.6" cy="12.4" r="1.5" fill="currentColor" />
              <path d="M2.6 7.4a6 6 0 0 1 6 6M2.6 3a10.4 10.4 0 0 1 10.4 10.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </div>

      <div className="progress-rail" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </header>
  );
}
