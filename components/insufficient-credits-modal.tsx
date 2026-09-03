"use client";

import { Button } from "@/components/ui/button";

export function InsufficientCreditsModal({
  open,
  balance,
  cost,
  onClose,
}: {
  open: boolean;
  balance: number;
  cost: number;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="insufficient-credits-title"
        className="w-full max-w-md rounded-[1.25em] border border-white/12 bg-[var(--drape-surface)] p-7 shadow-2xl"
      >
        <h2
          id="insufficient-credits-title"
          className="text-3xl font-semibold tracking-tight"
        >
          Not enough credits.
        </h2>
        <p className="mt-4 text-[var(--drape-muted)]">
          You have {balance}. This job costs {cost}.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/pricing">View pricing</Button>
          <Button variant="outline" type="button" arrow={false} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
