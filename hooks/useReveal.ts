"use client";
import { useEffect, useRef } from "react";

/**
 * Reveals children on first scroll into view. One observer for the whole
 * subtree, so the cost does not grow with the number of entries.
 */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = Array.from(
      container.querySelectorAll<HTMLElement>(".reveal"),
    );

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      targets.forEach((target) => target.setAttribute("data-shown", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (!record.isIntersecting) continue;
          record.target.setAttribute("data-shown", "true");
          observer.unobserve(record.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    targets.forEach((target) => {
      // Anything already on screen shows immediately, with no fade-in flash.
      if (target.getBoundingClientRect().top < window.innerHeight) {
        target.setAttribute("data-shown", "true");
      } else {
        observer.observe(target);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
