import type { Plan, Workflow } from "./types";

export const TRIAL_CREDITS = 20;

export const CREDIT_COSTS: Record<Workflow, number> = {
  studio: 1,
  lifestyle: 1,
  tryon: 2,
  variants: 4,
  video: 10,
};

export const MONTHLY_CREDITS: Record<Exclude<Plan, "trial">, number> = {
  starter: 50,
  pro: 150,
  business: 400,
  agency: 1200,
};

export const PLAN_PRICE_EGP: Record<Exclude<Plan, "trial">, number> = {
  starter: 400,
  pro: 1000,
  business: 2500,
  agency: 6000,
};

export function creditCost(workflow: Workflow): number {
  return CREDIT_COSTS[workflow];
}

export function hasEnoughCredits(balance: number, workflow: Workflow): boolean {
  return balance >= creditCost(workflow);
}

export function monthlyGrant(plan: Exclude<Plan, "trial">): number {
  return MONTHLY_CREDITS[plan];
}

export function canChoosePaidPlan(currentPlan: Plan): boolean {
  return currentPlan === "trial";
}
