import { describe, expect, it } from "vitest";
import { executeGenerate, type GenerateInput, type GenerationRepo, type ProfileRow } from "./generate-service";

const cutout = Buffer.from("png");

const studioInput: GenerateInput = {
  userId: "u1",
  workflow: "studio",
  background: "white",
  cutoutPng: cutout,
};

const offline = {
  now: async () => {},
  compose: async () => ({
    shop: Buffer.from("s"),
    story: Buffer.from("t"),
    whatsapp: Buffer.from("w"),
  }),
  upload: async () => [
    "https://example.com/shop.jpg",
    "https://example.com/story.jpg",
    "https://example.com/whatsapp.jpg",
  ],
};

function fakeRepo(init: {
  credits: number;
  failInsert?: boolean;
  profile?: ProfileRow | null;
}): GenerationRepo & { credits: number; rows: { id: string; status: string; creditsUsed: number }[] } {
  const state = {
    credits: init.credits,
    rows: [] as { id: string; status: string; creditsUsed: number; error?: string; paths?: string[] }[],
  };
  const profile = init.profile === undefined ? { credits: state.credits, plan: "trial" } : init.profile;
  return {
    get credits() {
      return state.credits;
    },
    get rows() {
      return state.rows;
    },
    async getProfile(): Promise<ProfileRow | null> {
      if (profile === null) return null;
      return { ...profile, credits: state.credits };
    },
    async insertRunning() {
      const id = "job-1";
      state.rows.push({ id, status: "running", creditsUsed: 0 });
      return { id };
    },
    async markDone(id, outputPaths, creditsUsed) {
      const row = state.rows.find((r) => r.id === id)!;
      row.status = "done";
      row.creditsUsed = creditsUsed;
      row.paths = outputPaths;
    },
    async markFailed(id, errorMessage) {
      const row = state.rows.find((r) => r.id === id)!;
      row.status = "failed";
      row.error = errorMessage;
    },
    async decrementCredits(_userId, amount) {
      state.credits -= amount;
    },
  };
}

describe("executeGenerate", () => {
  it("returns 401 when getProfile returns null", async () => {
    const repo = fakeRepo({ credits: 20, profile: null });
    const result = await executeGenerate(repo, studioInput, offline);
    expect(result).toEqual({ ok: false, status: 401, message: "Please sign in again." });
    expect(repo.rows).toHaveLength(0);
  });

  it("returns 402 and inserts nothing when credits are too low", async () => {
    const repo = fakeRepo({ credits: 0 });
    const result = await executeGenerate(repo, studioInput, offline);
    expect(result).toEqual({ ok: false, status: 402, message: "Not enough credits." });
    expect(repo.rows).toHaveLength(0);
    expect(repo.credits).toBe(0);
  });

  it("returns 400 for a non-studio workflow", async () => {
    const repo = fakeRepo({ credits: 20 });
    const result = await executeGenerate(
      repo,
      { userId: "u1", workflow: "video", background: "white", cutoutPng: cutout } as GenerateInput,
      offline,
    );
    expect(result).toEqual({ ok: false, status: 400, message: "Invalid workflow." });
    expect(repo.rows).toHaveLength(0);
    expect(repo.credits).toBe(20);
  });

  it("composes, uploads three paths, and decrements one credit on success", async () => {
    const repo = fakeRepo({ credits: 20 });
    const result = await executeGenerate(repo, studioInput, offline);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.outputPaths).toHaveLength(3);
      expect(result.creditsUsed).toBe(1);
    }
    expect(repo.credits).toBe(19);
    expect(repo.rows[0].status).toBe("done");
  });

  it("marks failed and does not decrement when compose throws", async () => {
    const repo = fakeRepo({ credits: 20 });
    const result = await executeGenerate(repo, studioInput, {
      ...offline,
      compose: async () => {
        throw new Error("compose failed");
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(500);
    expect(repo.credits).toBe(20);
    expect(repo.rows[0].status).toBe("failed");
  });

  it("marks failed and does not decrement when upload throws", async () => {
    const repo = fakeRepo({ credits: 20 });
    const result = await executeGenerate(repo, studioInput, {
      ...offline,
      upload: async () => {
        throw new Error("upload failed");
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(500);
    expect(repo.credits).toBe(20);
    expect(repo.rows[0].status).toBe("failed");
  });
});
