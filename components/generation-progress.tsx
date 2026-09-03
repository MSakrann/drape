export function GenerationProgress({
  stages,
  activeIndex,
}: {
  stages: string[];
  activeIndex: number;
}) {
  return (
    <div aria-live="polite">
      <p className="text-sm font-medium text-[var(--drape-accent)]">
        {stages[activeIndex]}
      </p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-3">
        {stages.map((stage, index) => {
          const active = index === activeIndex;
          const complete = index < activeIndex;

          return (
            <li
              key={stage}
              aria-current={active ? "step" : undefined}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                active
                  ? "border-[var(--drape-accent)] text-[var(--drape-text)]"
                  : complete
                    ? "border-white/20 text-[var(--drape-muted)]"
                    : "border-white/10 text-[var(--drape-dim)]"
              }`}
            >
              {stage}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
