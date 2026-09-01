import { canChoosePaidPlan, monthlyGrant } from "./credits";
import type { Plan } from "./types";

export type PlanRepo = {
  getPlanAndCredits(userId: string): Promise<{ plan: Plan; credits: number } | null>;
  setPlan(userId: string, plan: Exclude<Plan, "trial">, nextCredits: number): Promise<void>;
};

export async function executeChoosePlan(
  repo: PlanRepo,
  userId: string,
  plan: Plan,
): Promise<
  { ok: true; plan: Plan; credits: number } | { ok: false; status: 400 | 401 | 409; message: string }
> {
  if (plan === "trial") {
    return { ok: false, status: 400, message: "Choose a paid plan." };
  }

  const profile = await repo.getPlanAndCredits(userId);
  if (!profile) {
    return { ok: false, status: 401, message: "Please sign in again." };
  }

  if (!canChoosePaidPlan(profile.plan)) {
    return { ok: false, status: 409, message: "You already have a plan." };
  }

  const nextCredits = profile.credits + monthlyGrant(plan);
  await repo.setPlan(userId, plan, nextCredits);

  return { ok: true, plan, credits: nextCredits };
}
