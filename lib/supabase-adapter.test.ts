import { describe, expect, it, vi } from "vitest";

import { supabaseGenerationRepo } from "./supabase/adapter";
import { supabasePlanRepo } from "./supabase/adapter";

describe("supabaseGenerationRepo", () => {
  it("decrements credits through the atomic database function", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 8, error: null });
    const repo = supabaseGenerationRepo({ rpc } as never);

    await repo.decrementCredits("user-1", 2);

    expect(rpc).toHaveBeenCalledWith("decrement_credits", {
      p_id: "user-1",
      p_amount: 2,
    });
  });

  it("rejects a decrement when the database changes no profile", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const repo = supabaseGenerationRepo({ rpc } as never);

    await expect(repo.decrementCredits("user-1", 2)).rejects.toThrow(
      "Not enough credits.",
    );
  });
});

describe("supabasePlanRepo", () => {
  it("chooses a paid plan through the guarded database function", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ plan: "pro", credits: 170 }],
      error: null,
    });
    const repo = supabasePlanRepo({ rpc } as never);

    await repo.setPlan("user-1", "pro", 170);

    expect(rpc).toHaveBeenCalledWith("choose_paid_plan", {
      p_id: "user-1",
      p_plan: "pro",
    });
  });
});
