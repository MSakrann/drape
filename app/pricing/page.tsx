import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { CREDIT_COSTS } from "@/lib/credits";
import { getUserId } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types";

import { PlanCards } from "./plan-cards";

const creditCosts = [
  ["Studio", CREDIT_COSTS.studio],
  ["Lifestyle", CREDIT_COSTS.lifestyle],
  ["Try-on", CREDIT_COSTS.tryon],
  ["Variants", CREDIT_COSTS.variants],
  ["Video", CREDIT_COSTS.video],
] as const;

export default async function PricingPage() {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);
  let currentPlan: Plan | null = null;
  let credits: number | undefined;

  if (userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("plan, credits")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    currentPlan = data.plan as Plan;
    credits = data.credits;
  }

  return (
    <>
      <SiteHeader signedIn={Boolean(userId)} credits={credits} />
      <main className="px-6 py-16 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-wider text-[var(--drape-accent)]">
              Pricing
            </p>
            <h1 className="mt-4 text-5xl font-semibold uppercase tracking-tight md:text-7xl">
              Credits that fit your studio
            </h1>
            <p className="mt-6 text-xl text-[var(--drape-muted)]">
              Trial includes 20 credits. No card required.
            </p>
          </div>

          <PlanCards
            signedIn={Boolean(userId)}
            currentPlan={currentPlan}
          />

          <section className="mt-20">
            <h2 className="text-3xl font-semibold uppercase tracking-tight md:text-5xl">
              Credit costs
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {creditCosts.map(([workflow, cost]) => (
                <Card key={workflow} className="p-6">
                  <h3 className="text-xl font-semibold">{workflow}</h3>
                  <p className="mt-4 text-[var(--drape-muted)]">
                    {cost} {cost === 1 ? "credit" : "credits"}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
