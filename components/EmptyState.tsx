type EmptyStateProps = {
  title: string;
  hint: string;
  onReset?: () => void;
};

export default function EmptyState({ title, hint, onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        style={{ color: "var(--line-strong)" }}
      >
        <rect x="6.5" y="9.5" width="27" height="21" rx="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11 16h12M11 21h18M11 26h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>

      <p
        className="mt-4 font-display text-[19px]"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </p>
      <p
        className="mt-1 max-w-[34ch] font-sans text-[13.5px] leading-6"
        style={{ color: "var(--text-faint)" }}
      >
        {hint}
      </p>

      {onReset ? (
        <button type="button" onClick={onReset} className="btn mt-5">
          Reset the view
        </button>
      ) : null}
    </div>
  );
}
