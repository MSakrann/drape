export function Logo({ className }: { className?: string }) {
  return (
    // Native img keeps SVG simple in Next.js 15 (no next/image width/height/unoptimized dance).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-5-transparent.svg"
      alt="Drape"
      width={160}
      height={120}
      className={className}
      style={{ width: 160, height: 120, objectFit: "contain" }}
    />
  );
}
