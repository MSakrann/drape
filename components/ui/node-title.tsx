export function NodeTitle({ lines }: { lines: string[] }) {
  return (
    <h1 className="flex flex-col items-center gap-1">
      {lines.map((line, index) => (
        <span
          key={`${index}-${line}`}
          className="bg-[var(--drape-accent)] text-[var(--drape-bg)] uppercase font-semibold tracking-tight px-4 py-2"
        >
          {line}
        </span>
      ))}
    </h1>
  );
}
