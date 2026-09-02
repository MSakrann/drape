import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreditsChip } from "@/components/credits-chip";
import { EmptyState } from "@/components/empty-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserId } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import type { GenerationStatus, Plan, Workflow } from "@/lib/types";

type Generation = {
  id: string;
  workflow: Workflow;
  status: GenerationStatus;
  output_paths: string[];
  created_at: string;
};

const WORKFLOW_LABELS: Record<Workflow, string> = {
  studio: "Studio",
  tryon: "Try-on",
  lifestyle: "Lifestyle",
  video: "Video",
  variants: "Variants",
};

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    redirect("/sign-in");
  }

  const [profileResult, generationsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", userId)
      .single(),
    supabase
      .from("generations")
      .select("id, workflow, status, output_paths, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (generationsResult.error) {
    throw generationsResult.error;
  }

  const profile = profileResult.data as { credits: number; plan: Plan };
  const generations = (generationsResult.data ?? []) as Generation[];

  return (
    <>
      <SiteHeader signedIn credits={profile.credits} />
      <main className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--drape-accent)]">
                Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-semibold uppercase tracking-tight md:text-6xl">
                Recent generations
              </h1>
              <div className="mt-5">
                <CreditsChip credits={profile.credits} plan={profile.plan} />
              </div>
            </div>
            <Button href="/generate">New generation</Button>
          </div>

          <section aria-label="Recent generations" className="mt-10">
            {generations.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {generations.map((generation) => (
                  <Link
                    key={generation.id}
                    href={`/results/${generation.id}`}
                    aria-label={`View ${WORKFLOW_LABELS[generation.workflow]} generation`}
                    className="group rounded-[1.25em]"
                  >
                    <GenerationCard generation={generation} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function GenerationCard({ generation }: { generation: Generation }) {
  const outputPath = generation.output_paths[0];

  return (
    <Card className="h-full overflow-hidden p-2 transition-transform group-hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--drape-bg)]">
        {outputPath ? (
          <Image
            src={outputPath}
            alt={`${WORKFLOW_LABELS[generation.workflow]} generation output`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            className={`flex h-full items-center justify-center bg-white/5 ${
              generation.status === "running" ? "animate-pulse" : ""
            }`}
          >
            <span className="text-sm font-bold uppercase tracking-wider text-[var(--drape-dim)]">
              {generation.status === "running" ? "Generating…" : "No output"}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 px-3 py-4">
        <div>
          <h2 className="text-lg font-semibold">
            {WORKFLOW_LABELS[generation.workflow]}
          </h2>
          <p className="mt-1 text-sm text-[var(--drape-muted)]">
            {new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
            }).format(new Date(generation.created_at))}
          </p>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--drape-accent)]">
          {generation.status}
        </span>
      </div>
    </Card>
  );
}
