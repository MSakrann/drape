"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Workflow } from "@/lib/types";

export function ResultActions({ workflow }: { workflow: Workflow }) {
  const router = useRouter();
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  async function regenerate() {
    setRegenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow }),
      });
      const result = (await response.json()) as {
        id?: string;
        message?: string;
      };

      if (!response.ok || !result.id) {
        throw new Error(result.message ?? "Generation failed. Try again.");
      }

      router.push(`/results/${result.id}`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Generation failed. Try again.",
      );
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={regenerating}
          onClick={() => void regenerate()}
        >
          {regenerating ? "Regenerating…" : "Regenerate"}
        </Button>
        <Button href="/dashboard" variant="outline">
          Dashboard
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-4 text-sm text-[var(--drape-destructive)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
