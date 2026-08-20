"use client";

const STEPS = [
  {
    title: "Paste what you already have",
    body: "A git log, a list of commits, or plain sentences typed by a person. You do not need conventional commits; without them the studio reads the wording instead.",
  },
  {
    title: "Curate the list",
    body: "Every line lands in a category you can change. Uncheck anything that should not ship, reword a line, reorder it. Housekeeping commits start unchecked.",
  },
  {
    title: "Pick a reader, then publish",
    body: "A voice rewrites the same changes for engineers, product, design, or a summary. Copy or download the result in any of seven formats.",
  },
];

type HowItWorksProps = {
  onStartTour: () => void;
};

export default function HowItWorks({ onStartTour }: HowItWorksProps) {
  return (
    <section aria-labelledby="how-it-works" className="pb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="how-it-works" className="label">
          How it works
        </h2>
        <button type="button" className="btn btn-sm" onClick={onStartTour}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6.4 6.2a1.7 1.7 0 1 1 1.9 1.9v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8.2" cy="11.2" r="0.75" fill="currentColor" />
          </svg>
          Take the tour
        </button>
      </div>

      <ol className="m-0 grid list-none gap-2.5 p-0 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="step-card">
            <span className="step-num" aria-hidden="true">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p
                className="font-sans text-[13.5px] font-medium leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {step.title}
              </p>
              <p
                className="mt-1.5 font-sans text-[12.5px] leading-[1.6]"
                style={{ color: "var(--text-faint)" }}
              >
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
