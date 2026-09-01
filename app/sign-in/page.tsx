"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBrowserClient } from "@/lib/supabase/client";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-white/12 bg-[var(--drape-bg)] px-4 text-[var(--drape-text)]";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage("Email or password is incorrect.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setErrorMessage("Email or password is incorrect.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader signedIn={false} />
      <main className="px-6 py-16">
        <Card className="mx-auto max-w-lg p-7 sm:p-10">
          <p className="text-sm uppercase tracking-wider text-[var(--drape-accent)]">
            Welcome back
          </p>
          <h1 className="mt-4 text-4xl font-semibold uppercase tracking-tight">
            Sign in
          </h1>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-bold uppercase tracking-wider">
              Email
              <input
                className={inputClass}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block text-sm font-bold uppercase tracking-wider">
              Password
              <input
                className={inputClass}
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {errorMessage ? (
              <p role="alert" className="text-sm text-[var(--drape-destructive)]">
                {errorMessage}
              </p>
            ) : null}

            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[var(--drape-muted)]">
            New to Drape?{" "}
            <Link className="font-bold text-[var(--drape-accent)]" href="/sign-up">
              Create an account
            </Link>
          </p>
        </Card>
      </main>
    </>
  );
}
