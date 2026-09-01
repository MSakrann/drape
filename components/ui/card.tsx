export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const classes = [
    "rounded-[1.25em] border border-white/12 bg-[var(--drape-surface)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
