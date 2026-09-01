import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CREDIT_COSTS, MONTHLY_CREDITS, PLAN_PRICE_EGP } from "@/lib/credits";

const plans = ["starter", "pro", "business", "agency"] as const;
const creditCosts = [
  ["Studio", CREDIT_COSTS.studio],
  ["Lifestyle", CREDIT_COSTS.lifestyle],
  ["Try-on", CREDIT_COSTS.tryon],
  ["Variants", CREDIT_COSTS.variants],
  ["Video", CREDIT_COSTS.video],
] as const;

export default function PricingPage() {
  return (
    <>
      <SiteHeader signedIn={false} />
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
                <Button href="/sign-up" className="mt-8 w-full">
                  Get started
                </Button>
              </Card>
            ))}
          </div>

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
