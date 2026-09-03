"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { GenerationProgress } from "@/components/generation-progress";
import { InsufficientCreditsModal } from "@/components/insufficient-credits-modal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { creditCost, hasEnoughCredits } from "@/lib/credits";
import {
  WORKFLOW_OPTIONS,
  WORKFLOW_TABS,
  validateUpload,
} from "@/lib/generate-page";
import { progressStages } from "@/lib/mock-generate";
import type { GenerationStatus, Plan, Workflow } from "@/lib/types";

type MeResponse = {
  credits: number;
  plan: Plan;
  email: string;
};

type GenerationResponse = {
  id: string;
  status: GenerationStatus;
};

const optionButtonClass = "drape-chip";

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    const abort = () => {
      window.clearTimeout(timeout);
      reject(new Error("aborted"));
    };

    signal.addEventListener("abort", abort, { once: true });
  });
}

export default function GeneratePage() {
  const router = useRouter();
  const mounted = useRef(true);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [workflow, setWorkflow] = useState<Workflow>("studio");
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [studioBackground, setStudioBackground] = useState("white");
  const [model, setModel] = useState("Model 1");
  const [lifestyle, setLifestyle] = useState("Cairo interior");
  const [variantColors, setVariantColors] = useState<string[]>([]);

  const balance = profile?.credits ?? 0;
  const cost = creditCost(workflow);
  const stages = progressStages(workflow);

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

  function selectWorkflow(nextWorkflow: Workflow) {
    if (generating) {
      return;
    }
    setWorkflow(nextWorkflow);
    setGenerationError("");
    setActiveIndex(0);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      setUploadError("");
      return;
    }

    const error = validateUpload(file);
    if (error) {
      event.target.value = "";
      setFileName("");
      setUploadError(error);
      return;
    }

    setFileName(file.name);
    setUploadError("");
  }

  function toggleVariant(color: string) {
    setVariantColors((selected) =>
      selected.includes(color)
        ? selected.filter((item) => item !== color)
        : selected.length < 4
          ? [...selected, color]
          : selected,
    );
  }

  async function handleGenerate() {
    setGenerationError("");

    if (!hasEnoughCredits(balance, workflow)) {
      setCreditsModalOpen(true);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    const progress = window.setInterval(() => {
      setActiveIndex((index) => Math.min(index + 1, stages.length - 1));
    }, 1_500);

    setGenerating(true);
    setActiveIndex(0);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow }),
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

      while (!controller.signal.aborted) {
        await wait(3_000, controller.signal);
        const pollResponse = await fetch(`/api/generations/${created.id}`, {
          signal: controller.signal,
        });
        if (!pollResponse.ok) {
          throw new Error("poll");
        }

        const generation = (await pollResponse.json()) as GenerationResponse;
        if (generation.status === "done") {
          router.push(`/results/${created.id}`);
          return;
        }
        if (generation.status === "failed") {
          throw new Error("generation");
        }
      }
    } catch {
      if (mounted.current) {
        setGenerationError("Generation failed. Try again.");
      }
    } finally {
      window.clearTimeout(timeout);
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

          <div
            className="mt-8 flex gap-2 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Generation workflow"
          >
            {WORKFLOW_TABS.map((tab) => (
              <button
                key={tab.workflow}
                type="button"
                role="tab"
                aria-selected={workflow === tab.workflow}
                className="drape-chip shrink-0"
                onClick={() => selectWorkflow(tab.workflow)}
              >
                {tab.label}
              </button>
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
                {WORKFLOW_TABS.find((tab) => tab.workflow === workflow)?.label} options
              </h2>
              <div className="mt-6">
                {workflow === "studio" ? (
                  <fieldset>
                    <legend className="sr-only">Studio background</legend>
                    <div className="grid gap-3 sm:grid-cols-3">
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
                          {option}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {workflow === "tryon" ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {WORKFLOW_OPTIONS.tryon.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={model === option}
                        className={optionButtonClass}
                        onClick={() => setModel(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}

                {workflow === "lifestyle" ? (
                  <label className="block text-xs font-medium uppercase tracking-wide text-[var(--drape-dim)]">
                    Scene
                    <select
                      className="drape-input"
                      value={lifestyle}
                      onChange={(event) => setLifestyle(event.target.value)}
                    >
                      {WORKFLOW_OPTIONS.lifestyle.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {workflow === "video" ? (
                  <div className="rounded-[0.875rem] border border-white/12 bg-[var(--drape-bg)] px-4 py-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--drape-dim)]">
                      Duration
                    </span>
                    <p className="mt-1 text-lg">15 seconds</p>
                  </div>
                ) : null}

                {workflow === "variants" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {WORKFLOW_OPTIONS.variants.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-pressed={variantColors.includes(color)}
                        className={optionButtonClass}
                        onClick={() => toggleVariant(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                ) : null}
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
                disabled={generating || profile === null}
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
