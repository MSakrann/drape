import Link from "next/link";
import { Logo } from "@/components/logo";

const footerLinkClass =
  "uppercase tracking-wide text-base font-semibold text-[var(--drape-dim)] transition-colors duration-200 hover:text-[var(--drape-accent)]";

export function SiteFooter() {
  return (
    <>
      <div role="separator" className="mx-auto h-px w-[70%] bg-white/20" />
      <footer className="bg-[var(--drape-bg)] px-6 py-10 lg:px-[clamp(0.25rem,4vw,5rem)]">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="Drape home">
            <Logo />
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/#workflows" className={footerLinkClass}>
              Product
            </Link>
            <Link href="/pricing" className={footerLinkClass}>
              Pricing
            </Link>
            <Link href="/terms" className={footerLinkClass}>
              Terms
            </Link>
            <Link href="/privacy" className={footerLinkClass}>
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
