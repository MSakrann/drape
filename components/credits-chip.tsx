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
    <div className="drape-chip">
      <span className="text-[var(--drape-accent)]">{credits} credits</span>
      <span aria-hidden="true" className="h-4 w-px bg-white/12" />
      <span className="text-[var(--drape-dim)]">{PLAN_LABELS[plan]}</span>
    </div>
  );
}
