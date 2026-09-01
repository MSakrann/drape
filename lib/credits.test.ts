import { describe, expect, it } from "vitest";
import {
  CREDIT_COSTS,
  MONTHLY_CREDITS,
  PLAN_PRICE_EGP,
  TRIAL_CREDITS,
  canChoosePaidPlan,
  creditCost,
  hasEnoughCredits,
  monthlyGrant,
} from "./credits";

describe("creditCost", () => {
  it("matches spec costs", () => {
    expect(creditCost("studio")).toBe(1);
    expect(creditCost("lifestyle")).toBe(1);
    expect(creditCost("tryon")).toBe(2);
    expect(creditCost("variants")).toBe(4);
    expect(creditCost("video")).toBe(10);
  });
});

describe("hasEnoughCredits", () => {
  it("is true when balance equals cost", () => {
    expect(hasEnoughCredits(10, "video")).toBe(true);
  });
  it("is false when balance is below cost", () => {
    expect(hasEnoughCredits(9, "video")).toBe(false);
  });
});

describe("plans", () => {
  it("uses trial 20 and listed EGP prices and grants", () => {
    expect(TRIAL_CREDITS).toBe(20);
    expect(PLAN_PRICE_EGP.starter).toBe(400);
    expect(PLAN_PRICE_EGP.pro).toBe(1000);
    expect(PLAN_PRICE_EGP.business).toBe(2500);
    expect(PLAN_PRICE_EGP.agency).toBe(6000);
    expect(monthlyGrant("starter")).toBe(50);
    expect(monthlyGrant("pro")).toBe(150);
    expect(monthlyGrant("business")).toBe(400);
    expect(monthlyGrant("agency")).toBe(1200);
  });
  it("allows choosing a paid plan only from trial", () => {
    expect(canChoosePaidPlan("trial")).toBe(true);
    expect(canChoosePaidPlan("starter")).toBe(false);
    expect(canChoosePaidPlan("pro")).toBe(false);
  });
});
