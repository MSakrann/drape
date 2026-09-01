export function Logo({ className }: { className?: string }) {
  return (
    // Native img keeps SVG simple in Next.js 15 (no next/image width/height/unoptimized dance).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Drape"
      height={40}
      className={className}
      style={{ height: 40, width: "auto" }}
    />
  );
}
