"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const navLinkClass =
  "uppercase tracking-wider text-sm font-extrabold";

type SiteHeaderProps = {
  signedIn: boolean;
  credits?: number;
  onSignOut?: () => void;
};

export function SiteHeader({ signedIn, credits, onSignOut }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--drape-bg)] px-6 py-5 lg:px-[clamp(0.25rem,4vw,5rem)] lg:py-8">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label="Drape home" className="justify-self-start">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/#workflows" className={navLinkClass}>
            Product
          </Link>
          <Link href="/pricing" className={navLinkClass}>
            Pricing
          </Link>
        </nav>

        <div className="hidden items-center justify-end gap-3 lg:flex">
          {signedIn ? (
            <SignedInActions credits={credits} onSignOut={onSignOut} />
          ) : (
            <PublicActions />
          )}
        </div>

        <button
          type="button"
          className="justify-self-end size-10 rounded-xl bg-[var(--drape-accent)] text-[var(--drape-bg)] lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen ? (
        <div className="mt-5 flex flex-col gap-4 border-t border-white/12 pt-5 lg:hidden">
          <Link href="/#workflows" className={navLinkClass} onClick={closeMenu}>
            Product
          </Link>
          <Link href="/pricing" className={navLinkClass} onClick={closeMenu}>
            Pricing
          </Link>
          {signedIn ? (
            <>
              <Link href="/dashboard" className={navLinkClass} onClick={closeMenu}>
                Dashboard
              </Link>
              <p className={navLinkClass}>{credits} credits</p>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  onSignOut?.();
                  closeMenu();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" href="/sign-in">
                Sign in
              </Button>
              <Button href="/sign-up">Get started</Button>
            </>
          )}
        </div>
      ) : null}
    </header>
  );
}

function PublicActions() {
  return (
    <>
      <Button variant="outline" href="/sign-in">
        Sign in
      </Button>
      <Button href="/sign-up">Get started</Button>
    </>
  );
}

function SignedInActions({
  credits,
  onSignOut,
}: {
  credits?: number;
  onSignOut?: () => void;
}) {
  return (
    <>
      <Button href="/dashboard">Dashboard</Button>
      <p className={navLinkClass}>{credits} credits</p>
      <Button variant="outline" type="button" onClick={() => onSignOut?.()}>
        Sign out
      </Button>
    </>
  );
}
