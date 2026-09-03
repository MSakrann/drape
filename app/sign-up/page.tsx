"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBrowserClient } from "@/lib/supabase/client";

const inputClass = "drape-input";

function signUpErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("user already registered")
  ) {
    return "An account with this email already exists.";
  }

  if (
    normalized.includes("password") ||
    normalized.includes("weak") ||
    normalized.includes("characters")
  ) {
    return "Use a password with at least 8 characters.";
  }

  return "Something went wrong. Check your connection.";
}

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 8) {
      setErrorMessage("Use a password with at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setErrorMessage(signUpErrorMessage(error.message));
        return;
      }

      if (!data.session) {
        setSuccessMessage("Check your email to confirm your account.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setErrorMessage("Something went wrong. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader signedIn={false} />
      <main className="px-6 py-16">
        <Card className="mx-auto max-w-lg p-7 sm:p-10">
          <p className="text-sm font-medium text-[var(--drape-accent)]">
            Get started
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Create your account
          </h1>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-xs font-medium uppercase tracking-wide text-[var(--drape-dim)]">
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

            <label className="block text-xs font-medium uppercase tracking-wide text-[var(--drape-dim)]">
              Password
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
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
            {successMessage ? (
              <p role="status" className="text-sm text-[var(--drape-accent)]">
                {successMessage}
              </p>
            ) : null}

            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[var(--drape-muted)]">
            Already have an account?{" "}
            <Link className="font-medium text-[var(--drape-accent)]" href="/sign-in">
              Sign in
            </Link>
          </p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
