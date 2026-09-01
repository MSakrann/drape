"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MONTHLY_CREDITS, PLAN_PRICE_EGP } from "@/lib/credits";
import type { Plan } from "@/lib/types";

const plans = ["starter", "pro", "business", "agency"] as const;
type PaidPlan = (typeof plans)[number];

export function PlanCards({
  signedIn,
  currentPlan,
}: {
  signedIn: boolean;
  currentPlan: Plan | null;
}) {
  const router = useRouter();
  const [choosing, setChoosing] = useState<PaidPlan | null>(null);
  const [error, setError] = useState("");
  const paidPlan = currentPlan && currentPlan !== "trial" ? currentPlan : null;

  async function choosePlan(plan: PaidPlan) {
    setChoosing(plan);
    setError("");

    try {
      const response = await fetch("/api/billing/choose-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "Could not choose this plan.");
      }

      router.push("/dashboard");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not choose this plan.",
      );
    } finally {
      setChoosing(null);
    }
  }

  return (
    <>
      {paidPlan ? (
        <p className="mt-8 text-lg text-[var(--drape-accent)]">
          You are on the {paidPlan} plan.
        </p>
      ) : null}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan} className="flex flex-col p-6">
            <h2 className="text-2xl font-semibold capitalize">{plan}</h2>
            <p className="mt-7 text-4xl font-semibold">
              {PLAN_PRICE_EGP[plan]} EGP
            </p>
            <p className="mt-2 text-[var(--drape-muted)]">
              {MONTHLY_CREDITS[plan]} credits / month
            </p>
            {!signedIn ? (
              <Button href="/sign-up" className="mt-8 w-full">
                Get started
              </Button>
            ) : currentPlan === "trial" ? (
              <Button
                type="button"
                className="mt-8 w-full"
                disabled={choosing !== null}
                onClick={() => void choosePlan(plan)}
              >
                {choosing === plan ? "Choosing…" : "Choose plan"}
              </Button>
            ) : null}
          </Card>
        ))}
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-6 text-sm text-[var(--drape-destructive)]"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
