import { AnnouncementBanner } from "@/components/announcement-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NodeTitle } from "@/components/ui/node-title";
import { MONTHLY_CREDITS, PLAN_PRICE_EGP } from "@/lib/credits";
import { SAMPLE_PATHS } from "@/lib/mock-generate";
import Image from "next/image";

const marqueeItems = [
  "Abayas",
  "Kaftans",
  "Modest wear",
  "Street",
  "Tailoring",
  "Evening",
  "Hijab",
  "Menswear",
  "Kids",
  "Accessories",
];

const workflows = [
  {
    title: "Studio",
    image: SAMPLE_PATHS[3],
    blurb: "Clean white-studio product shots from a handheld photo.",
  },
  {
    title: "Try-on",
    image: SAMPLE_PATHS[4],
    blurb: "See the garment on model references, hijab or not.",
  },
  {
    title: "Lifestyle",
    image: SAMPLE_PATHS[5],
    blurb: "Place the piece in Cairo interiors, the Nile, or the street.",
  },
  {
    title: "Video",
    image: SAMPLE_PATHS[6],
    blurb: "A 15-second vertical clip for Reels and TikTok.",
  },
  {
    title: "Variants",
    image: SAMPLE_PATHS[7],
    blurb: "The same piece in navy, rose, olive, and cream.",
  },
];

const plans = ["starter", "pro", "business", "agency"] as const;

export default function Page() {
  return (
    <>
      <AnnouncementBanner message="Studio, try-on, and lifestyle shots from a single product photo." />
      <SiteHeader signedIn={false} />
      <main>
        <section className="px-6 pt-6 pb-16 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
            <NodeTitle lines={["Studio product photos", "from a phone shot."]} />
            <p className="mt-7 max-w-3xl text-lg text-[var(--drape-muted)] md:text-xl">
              Drape turns a garment photo into studio, on-model, lifestyle, color
              variants, and video — built for Egyptian brands selling online.
            </p>
            <Button href="/sign-up" className="mt-8">
              Get started for free
            </Button>
            <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
              {SAMPLE_PATHS.slice(0, 3).map((image, index) => (
                <Card key={image} className="overflow-hidden p-2">
                  <Image
                    src={image}
                    alt={index === 0 ? "Input garment photo" : "Drape output"}
                    width={800}
                    height={1000}
                    className="aspect-[4/5] w-full rounded-2xl object-cover"
                  />
                  <p className="px-3 py-3 text-left text-sm uppercase tracking-wider text-[var(--drape-muted)]">
                    {index === 0 ? "Input" : "Output"}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Fashion categories" className="overflow-hidden py-8">
          <div className="flex w-max animate-[drape-marquee_30s_linear_infinite]">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="px-7 text-sm font-bold uppercase tracking-wider text-[var(--drape-muted)]"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section id="workflows" className="px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {workflows.map((workflow, index) => (
              <div
                key={workflow.title}
                className="grid items-center gap-8 border-t border-white/12 py-12 md:grid-cols-2"
              >
                <Card
                  className={`overflow-hidden p-2 ${
                    index % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  <Image
                    src={workflow.image}
                    alt={`${workflow.title} workflow`}
                    width={1200}
                    height={900}
                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                </Card>
                <div className="flex flex-col items-start gap-5">
                  <h2 className="text-4xl font-semibold uppercase tracking-tight md:text-6xl">
                    {workflow.title}
                  </h2>
                  <p className="max-w-xl text-lg text-[var(--drape-muted)]">
                    {workflow.blurb}
                  </p>
                  <Button href="/sign-up">Get started</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-4xl font-semibold uppercase tracking-tight md:text-6xl">
              How it works
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <Card className="p-6">
                <Image
                  src={SAMPLE_PATHS[8]}
                  alt="Garment ready to upload"
                  width={800}
                  height={800}
                  className="mb-6 aspect-square w-full rounded-2xl object-cover"
                />
                <p className="text-sm uppercase tracking-wider text-[var(--drape-accent)]">
                  Step 1
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  Upload a product photo
                </h3>
              </Card>
              <Card className="p-6">
                <Image
                  src={SAMPLE_PATHS[9]}
                  alt="Drape fashion workflow"
                  width={800}
                  height={800}
                  className="mb-6 aspect-square w-full rounded-2xl object-cover"
                />
                <p className="text-sm uppercase tracking-wider text-[var(--drape-accent)]">
                  Step 2
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  Pick Studio, Try-on, Lifestyle, Video, or Variants
                </h3>
              </Card>
              <Card className="flex min-h-full flex-col justify-end p-6">
                <p className="text-sm uppercase tracking-wider text-[var(--drape-accent)]">
                  Step 3
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  Download and post
                </h3>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm uppercase tracking-wider text-[var(--drape-accent)]">
                  Pricing
                </p>
                <h2 className="mt-3 text-4xl font-semibold uppercase tracking-tight md:text-6xl">
                  Pick your pace
                </h2>
              </div>
              <Button href="/pricing" variant="outline">
                View pricing
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <Card key={plan} className="p-6">
                  <h3 className="text-xl font-semibold capitalize">{plan}</h3>
                  <p className="mt-5 text-4xl font-semibold">
                    {PLAN_PRICE_EGP[plan]} EGP
                  </p>
                  <p className="mt-2 text-[var(--drape-muted)]">
                    {MONTHLY_CREDITS[plan]} credits / month
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
