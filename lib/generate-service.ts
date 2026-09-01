import { creditCost, hasEnoughCredits } from "./credits";
import { mockDelayMs, pickOutputPaths } from "./mock-generate";
import type { Workflow } from "./types";

export type GenerateInput = { userId: string; workflow: Workflow };
export type GenerateOk = { ok: true; id: string; outputPaths: string[]; creditsUsed: number };
export type GenerateErr = { ok: false; status: 401 | 402 | 500; message: string };

export type ProfileRow = { credits: number; plan: string };

export type GenerationRepo = {
  getProfile(userId: string): Promise<ProfileRow | null>;
  insertRunning(userId: string, workflow: Workflow): Promise<{ id: string }>;
  markDone(id: string, outputPaths: string[], creditsUsed: number): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
  decrementCredits(userId: string, amount: number): Promise<void>;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeGenerate(
  repo: GenerationRepo,
  input: GenerateInput,
  options?: { fail?: boolean; now?: () => Promise<void> },
): Promise<GenerateOk | GenerateErr> {
  const profile = await repo.getProfile(input.userId);
  if (!profile) {
    return { ok: false, status: 401, message: "Please sign in again." };
  }

  if (!hasEnoughCredits(profile.credits, input.workflow)) {
    return { ok: false, status: 402, message: "Not enough credits." };
  }

  const { id } = await repo.insertRunning(input.userId, input.workflow);
  const wait = options?.now ?? (() => delay(mockDelayMs(input.workflow)));
  await wait();

  if (options?.fail) {
    const message = "Generation failed. Try again.";
    await repo.markFailed(id, message);
    return { ok: false, status: 500, message };
  }

  const outputPaths = pickOutputPaths(input.workflow);
  const creditsUsed = creditCost(input.workflow);
  await repo.markDone(id, outputPaths, creditsUsed);
  await repo.decrementCredits(input.userId, creditsUsed);

  return { ok: true, id, outputPaths, creditsUsed };
}
