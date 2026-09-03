import Link from "next/link";
import { Logo } from "@/components/logo";

const footerLinkClass =
  "text-sm font-medium text-white/55 transition-colors duration-200 hover:text-[var(--drape-accent)]";

export function SiteFooter() {
  return (
    <footer className="bg-[#0a0a0a] px-6 py-10 lg:px-[clamp(0.25rem,4vw,5rem)]">
      <div className="flex flex-col items-start gap-8 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <a href="/" aria-label="Drape home">
          <Logo />
        </a>
        <nav className="flex flex-wrap gap-x-6 gap-y-3">
          <a href="/#works" className={footerLinkClass}>
            Product
          </a>
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
  );
}
