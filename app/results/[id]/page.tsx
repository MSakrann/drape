import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { getUserId } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import type { Workflow } from "@/lib/types";

import { ResultActions } from "./result-actions";

type Generation = {
  id: string;
  workflow: Workflow;
  output_paths: string[];
};

const WORKFLOW_LABELS: Record<Workflow, string> = {
  studio: "Studio",
  tryon: "Try-on",
  lifestyle: "Lifestyle",
  video: "Video",
  variants: "Variants",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const [generationResult, profileResult] = await Promise.all([
    supabase
      .from("generations")
      .select("id, workflow, output_paths")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single(),
  ]);

  if (generationResult.error) {
    throw generationResult.error;
  }

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (!generationResult.data) {
    notFound();
  }

  const generation = generationResult.data as Generation;

  return (
    <>
      <SiteHeader signedIn credits={profileResult.data.credits} />
      <main className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium text-[var(--drape-accent)]">
            Results
          </p>
          <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                {WORKFLOW_LABELS[generation.workflow]} generation
              </h1>
              <p className="mt-4 text-[var(--drape-muted)]">
                Open an image to view it full size, or download it directly.
              </p>
            </div>
            <ResultActions workflow={generation.workflow} />
          </div>

          {generation.output_paths.length > 0 ? (
            <section
              aria-label="Generation outputs"
              className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {generation.output_paths.map((path, index) => (
                <Card key={`${path}-${index}`} className="overflow-hidden p-2">
                  <a
                    href={path}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open output ${index + 1} full size`}
                    className="block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/[0.03]">
                      <Image
                        src={path}
                        alt={`${WORKFLOW_LABELS[generation.workflow]} output ${index + 1}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform hover:scale-[1.02]"
                      />
                    </div>
                  </a>
                  <div className="flex items-center justify-between gap-4 px-3 py-4">
                    <span className="text-sm font-medium text-[var(--drape-muted)]">
                      {generation.workflow === "video"
                        ? "Video preview (mock)"
                        : `Output ${index + 1}`}
                    </span>
                    <a
                      href={path}
                      download
                      className="text-sm font-medium text-[var(--drape-accent)]"
                    >
                      Download
                    </a>
                  </div>
                </Card>
              ))}
            </section>
          ) : (
            <Card className="mt-10 p-8 text-center text-[var(--drape-muted)]">
              No outputs are available for this generation.
            </Card>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
