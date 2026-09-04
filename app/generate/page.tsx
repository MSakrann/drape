"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { GenerationProgress } from "@/components/generation-progress";
import { InsufficientCreditsModal } from "@/components/insufficient-credits-modal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { catalogProgressStages } from "@/lib/catalog-pack";
import { creditCost, hasEnoughCredits } from "@/lib/credits";
import {
  WORKFLOW_OPTIONS,
  WORKFLOW_TABS,
  validateUpload,
} from "@/lib/generate-page";
import { removeBackground } from "@/lib/remove-background";
import type { Plan, Workflow } from "@/lib/types";

type MeResponse = {
  credits: number;
  plan: Plan;
  email: string;
};

const optionButtonClass = "drape-chip";
const CUTOUT_ERROR =
  "Could not cut out that photo. Try a clearer shot on a plain surface.";

export default function GeneratePage() {
  const router = useRouter();
  const mounted = useRef(true);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const workflow: Workflow = "studio";
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [studioBackground, setStudioBackground] = useState("white");

  const balance = profile?.credits ?? 0;
  const cost = creditCost(workflow);
  const stages = catalogProgressStages();

  useEffect(() => {
    mounted.current = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/me");
        if (response.status === 401) {
          router.push("/sign-in");
          return;
        }
        if (!response.ok) {
          throw new Error("profile");
        }
        const nextProfile = (await response.json()) as MeResponse;
        if (mounted.current) {
          setProfile(nextProfile);
        }
      } catch {
        if (mounted.current) {
          router.push("/sign-in");
        }
      }
    }

    void loadProfile();
    return () => {
      mounted.current = false;
    };
  }, [router]);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFile(null);
      setFileName("");
      setUploadError("");
      return;
    }

    const error = validateUpload(file);
    if (error) {
      event.target.value = "";
      setFile(null);
      setFileName("");
      setUploadError(error);
      return;
    }

    setFile(file);
    setFileName(file.name);
    setUploadError("");
  }

  async function handleGenerate() {
    setGenerationError("");

    if (!file) {
      return;
    }

    if (!hasEnoughCredits(balance, workflow)) {
      setCreditsModalOpen(true);
      return;
    }

    const controller = new AbortController();
    let timeout: number | undefined;
    const progress = window.setInterval(() => {
      setActiveIndex((index) => Math.min(index + 1, stages.length - 1));
    }, 1_500);

    setGenerating(true);
    setActiveIndex(0);

    try {
      let cutout: Blob;
      try {
        cutout = await removeBackground(file);
      } catch {
        if (mounted.current) {
          setGenerationError(CUTOUT_ERROR);
        }
        return;
      }

      if (!mounted.current) {
        return;
      }

      setActiveIndex((index) => Math.max(index, 1));

      const form = new FormData();
      form.set("background", studioBackground);
      form.set(
        "cutout",
        new File([cutout], "cutout.png", {
          type: cutout.type || "image/png",
        }),
      );

      timeout = window.setTimeout(() => controller.abort(), 30_000);
      const response = await fetch("/api/generate", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      if (response.status === 402) {
        setCreditsModalOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error("generation");
      }

      const created = (await response.json()) as { id: string };
      router.push(`/results/${created.id}`);
    } catch {
      if (mounted.current) {
        setGenerationError("Generation failed. Try again.");
      }
    } finally {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
      window.clearInterval(progress);
      if (mounted.current) {
        setGenerating(false);
      }
    }
  }

  return (
    <>
      <SiteHeader signedIn credits={balance} />
      <main className="px-6 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-[var(--drape-accent)]">
            Generate
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            Create your campaign
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--drape-muted)]">
            Upload a phone photo of the garment. We cut it out and export Shop,
            Story, and WhatsApp sizes.
          </p>

          <div className="mt-8 flex gap-2 pb-2">
            {WORKFLOW_TABS.map((tab) => (
              <span
                key={tab.workflow}
                className="drape-chip shrink-0"
                data-active="true"
              >
                {tab.label}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Upload product
              </h2>
              <label className="mt-6 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.25em] border border-dashed border-white/25 bg-white/[0.03] p-8 text-center">
                <span className="text-lg font-semibold">
                  {fileName || "Choose a product image"}
                </span>
                <span className="mt-2 text-sm text-[var(--drape-muted)]">
                  JPEG or PNG, up to 10MB
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={generating}
                />
              </label>
              {uploadError ? (
                <p
                  role="alert"
                  className="mt-4 text-sm text-[var(--drape-destructive)]"
                >
                  {uploadError}
                </p>
              ) : null}
            </Card>

            <Card className="p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Catalog pack options
              </h2>
              <div className="mt-6">
                <fieldset>
                  <legend className="sr-only">Studio background</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {WORKFLOW_OPTIONS.studio.map((option) => (
                      <label
                        key={option}
                        className={optionButtonClass}
                        data-active={studioBackground === option}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="studio-background"
                          value={option}
                          checked={studioBackground === option}
                          onChange={() => setStudioBackground(option)}
                        />
                        {option === "white" ? "White" : "Grey"}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              {generating ? (
                <div className="mt-8">
                  <GenerationProgress
                    stages={stages}
                    activeIndex={activeIndex}
                  />
                </div>
              ) : null}

              {generationError ? (
                <p
                  role="alert"
                  className="mt-6 text-sm text-[var(--drape-destructive)]"
                >
                  {generationError}
                </p>
              ) : null}

              <Button
                className="mt-8 w-full"
                type="button"
                disabled={generating || profile === null || !file}
                onClick={() => void handleGenerate()}
              >
                {generating ? "Generating…" : `Generate · ${cost} credits`}
              </Button>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />

      <InsufficientCreditsModal
        open={creditsModalOpen}
        balance={balance}
        cost={cost}
        onClose={() => setCreditsModalOpen(false)}
      />
    </>
  );
}
