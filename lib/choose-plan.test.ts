import { describe, expect, it } from "vitest";
import { executeChoosePlan, type PlanRepo } from "./choose-plan";
import type { Plan } from "./types";

function repo(plan: Plan, credits: number): PlanRepo & { plan: Plan; credits: number } {
  const state = { plan, credits };
  return {
    get plan() {
      return state.plan;
    },
    get credits() {
      return state.credits;
    },
    async getPlanAndCredits() {
      return { plan: state.plan, credits: state.credits };
    },
    async setPlan(_id, nextPlan, nextCredits) {
      state.plan = nextPlan;
      state.credits = nextCredits;
    },
  };
}

describe("executeChoosePlan", () => {
  it("returns 401 when getPlanAndCredits returns null", async () => {
    const r: PlanRepo = {
      async getPlanAndCredits() {
        return null;
      },
      async setPlan() {},
    };
    const result = await executeChoosePlan(r, "u1", "pro");
    expect(result).toEqual({ ok: false, status: 401, message: "Please sign in again." });
  });

  it("adds 150 credits and sets pro from trial", async () => {
    const r = repo("trial", 20);
    const result = await executeChoosePlan(r, "u1", "pro");
    expect(result).toEqual({ ok: true, plan: "pro", credits: 170 });
  });

  it("rejects choosing the plan the user already has", async () => {
    const r = repo("pro", 170);
    const result = await executeChoosePlan(r, "u1", "pro");
    expect(result).toEqual({
      ok: false,
      status: 409,
      message: "You're already on this plan.",
    });
  });

  it("upgrades from starter to pro and adds 150 credits", async () => {
    const r = repo("starter", 50);
    const result = await executeChoosePlan(r, "u1", "pro");
    expect(result).toEqual({ ok: true, plan: "pro", credits: 200 });
  });

  it("rejects trial as the chosen plan", async () => {
    const r = repo("trial", 20);
    const result = await executeChoosePlan(r, "u1", "trial");
    expect(result).toEqual({ ok: false, status: 400, message: "Choose a paid plan." });
  });
});
