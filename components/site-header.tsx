"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";

const navLinkClass =
  "text-sm font-medium text-[#F0EFED]/80 transition-colors duration-200 hover:text-[var(--drape-accent)]";

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

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    onSignOut?.();
    window.location.assign("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--drape-bg)] px-6 py-4 lg:px-[clamp(0.25rem,4vw,5rem)]">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <a
          href="/"
          aria-label="Drape home"
          className="justify-self-start opacity-100 transition-opacity duration-200 hover:opacity-80"
        >
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          <a href="/#works" className={navLinkClass}>
            Product
          </a>
          <Link href="/pricing" className={navLinkClass}>
            Pricing
          </Link>
        </nav>

        <div className="hidden items-center justify-end gap-3 lg:flex">
          {signedIn ? (
            <SignedInActions credits={credits} onSignOut={handleSignOut} />
          ) : (
            <PublicActions />
          )}
        </div>

        <button
          type="button"
          className="justify-self-end inline-flex size-10 items-center justify-center rounded-[0.875rem] border border-white/18 bg-white/8 text-[#F0EFED] transition-colors duration-200 hover:bg-white/16 lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen ? (
        <div className="mt-5 flex flex-col gap-4 border-t border-white/12 pt-5 lg:hidden">
          <a href="/#works" className={navLinkClass} onClick={closeMenu}>
            Product
          </a>
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
                arrow={false}
                onClick={() => {
                  void handleSignOut();
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
      <Button variant="outline" type="button" arrow={false} onClick={() => onSignOut?.()}>
        Sign out
      </Button>
    </>
  );
}
