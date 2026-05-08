"use client";
import { useEffect } from "react";

export function useKeyboardNav(entryIds: string[]) {
  useEffect(() => {
    let currentIndex = -1;

    const getActiveIndex = () => {
      const scrollY = window.scrollY + window.innerHeight / 3;
      for (let i = entryIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(entryIds[i]);
        if (el && el.offsetTop <= scrollY) return i;
      }
      return 0;
    };

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "j" || e.key === "k") {
        e.preventDefault();
        if (currentIndex === -1) currentIndex = getActiveIndex();
        currentIndex = e.key === "j"
          ? Math.min(currentIndex + 1, entryIds.length - 1)
          : Math.max(currentIndex - 1, 0);

        const el = document.getElementById(entryIds[currentIndex]);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (e.key === "?") {
        // Toggle keyboard shortcut hint — handled by the component below
        document.dispatchEvent(new CustomEvent("toggle-kbd-hint"));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [entryIds]);
}
