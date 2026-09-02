export function NodeTitle({ lines }: { lines: string[] }) {
  return (
    <h1 className="flex flex-col items-center gap-1">
      {lines.map((line, index) => (
        <span
          key={`${index}-${line}`}
          className="bg-[var(--drape-accent)] text-[var(--drape-bg)] uppercase font-semibold tracking-wide px-5 py-3 text-4xl leading-none md:text-6xl"
        >
          {line}
        </span>
      ))}
    </h1>
  );
}
