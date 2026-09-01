import type { Plan } from "@/lib/types";

const PLAN_LABELS: Record<Plan, string> = {
  trial: "Trial",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  agency: "Agency",
};

export function CreditsChip({
  credits,
  plan,
}: {
  credits: number;
  plan: Plan;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-[var(--drape-surface)] px-4 py-2 text-sm font-bold uppercase tracking-wider">
      <span className="text-[var(--drape-accent)]">{credits} credits</span>
      <span aria-hidden="true" className="h-4 w-px bg-white/12" />
      <span className="text-[var(--drape-dim)]">{PLAN_LABELS[plan]}</span>
    </div>
  );
}
