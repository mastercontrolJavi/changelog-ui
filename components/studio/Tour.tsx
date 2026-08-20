"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type TourStep = {
  /** CSS selector for the panel to spotlight. Omit for a centred card. */
  target?: string;
  title: string;
  body: string;
  /** Runs when the step opens, so a step can demonstrate rather than describe. */
  onEnter?: () => void;
};

type Rect = { top: number; left: number; width: number; height: number };

const PADDING = 8;
const CARD_GAP = 14;
const CARD_WIDTH = 340;
const EDGE = 16;

type TourProps = {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
};

export default function Tour({ steps, open, onClose }: TourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = useState(200);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = steps[index];
  const target = step?.target;

  /* Held in a ref so a re-created steps array cannot re-fire a step's action. */
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    stepsRef.current[index]?.onEnter?.();
  }, [open, index]);

  /* The spotlight tracks the live position of its target, so scrolling or a
     resize never leaves the ring stranded. */
  const measure = useCallback(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const element = document.querySelector(target);
    if (!element) {
      setRect(null);
      return;
    }
    const box = element.getBoundingClientRect();
    setRect({
      top: box.top - PADDING,
      left: box.left - PADDING,
      width: box.width + PADDING * 2,
      height: box.height + PADDING * 2,
    });
  }, [target]);

  useLayoutEffect(() => {
    if (!open) return;

    const element = target ? document.querySelector(target) : null;

    if (element) {
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    // Measure after the smooth scroll has had a chance to settle.
    measure();
    const settle = window.setTimeout(measure, 420);

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [open, target, measure]);

  const next = useCallback(() => {
    if (index >= steps.length - 1) {
      onClose();
      return;
    }
    setIndex(index + 1);
  }, [index, steps.length, onClose]);

  const back = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, next, back, onClose]);

  useLayoutEffect(() => {
    const measured = cardRef.current?.offsetHeight;
    if (measured && measured !== cardHeight) setCardHeight(measured);
  }, [index, rect, cardHeight]);

  if (!open || !step) return null;

  const last = index === steps.length - 1;

  /* Below the target, else above it, else pinned inside the viewport - a panel
     taller than the screen has no "outside" that is still visible. */
  const cardStyle: React.CSSProperties = rect
    ? (() => {
        const limit = window.innerHeight - cardHeight - EDGE;
        const below = rect.top + rect.height + CARD_GAP;
        const above = rect.top - CARD_GAP - cardHeight;

        let top: number;
        if (below <= limit) top = below;
        else if (above >= EDGE) top = above;
        else top = limit;

        return {
          top: Math.min(Math.max(EDGE, top), Math.max(EDGE, limit)),
          left: Math.min(
            Math.max(EDGE, rect.left),
            Math.max(EDGE, window.innerWidth - CARD_WIDTH - EDGE),
          ),
        };
      })()
    : {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  return (
    <>
      {rect ? (
        <div
          className="spotlight"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="scrim" onClick={onClose} role="presentation" />
      )}

      <div
        ref={cardRef}
        className="tour-card"
        style={cardStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="label" style={{ color: "var(--accent)" }}>
              Step {index + 1} of {steps.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="label"
              style={{ cursor: "pointer" }}
            >
              Skip
            </button>
          </div>

          <h2
            id="tour-title"
            className="mt-2.5 font-display text-[18px] leading-tight"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.015em" }}
          >
            {step.title}
          </h2>

          <p
            className="mt-2 font-sans text-[13.5px] leading-[1.62]"
            style={{ color: "var(--text-muted)" }}
          >
            {step.body}
          </p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex gap-1" aria-hidden="true">
              {steps.map((_, dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 rounded-full transition-colors"
                  style={{
                    background:
                      dot === index ? "var(--accent)" : "var(--line-strong)",
                  }}
                />
              ))}
            </div>

            <div className="flex gap-1.5">
              {index > 0 ? (
                <button type="button" className="btn btn-sm" onClick={back}>
                  Back
                </button>
              ) : null}
              <button type="button" className="btn btn-primary btn-sm" onClick={next}>
                {last ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
