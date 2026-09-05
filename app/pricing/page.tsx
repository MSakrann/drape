import { IBM_Plex_Mono } from "next/font/google";

import { InvoiceStage } from "@/app/invoice/invoice-stage";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { CREDIT_COSTS } from "@/lib/credits";
import { loadOrCreateProfile } from "@/lib/profile";
import { getUserId } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types";

const receiptMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const creditCosts = [["Catalog pack", CREDIT_COSTS.studio]] as const;

export default async function PricingPage() {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);
  let currentPlan: Plan | null = null;
  let credits: number | undefined;

  if (userId) {
    const profile = await loadOrCreateProfile(supabase, userId);
    if (profile.ok) {
      currentPlan = profile.profile.plan;
      credits = profile.profile.credits;
    }
  }

  return (
    <>
      <SiteHeader signedIn={Boolean(userId)} credits={credits} />
      <main className="px-6 py-16 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[var(--drape-accent)]">
              Pricing
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
              Credits that fit your studio
            </h1>
            <p className="mt-6 text-xl text-[var(--drape-muted)]">
              Trial includes 20 credits. No card required.
            </p>
          </div>

          <div className="mt-12">
            <InvoiceStage
              receiptClassName={receiptMono.className}
              checkout
              signedIn={Boolean(userId)}
              currentPlan={currentPlan}
            />
          </div>

          <section className="mt-20">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Credit costs
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {creditCosts.map(([workflow, cost]) => (
                <Card key={workflow} className="p-6">
                  <h3 className="text-xl font-semibold">{workflow}</h3>
                  <p className="mt-4 text-[var(--drape-muted)]">
                    {cost} {cost === 1 ? "credit" : "credits"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--drape-muted)]">
                    Studio photos from a phone shot — Shop, Story, WhatsApp.
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
