import { composeCatalogPack } from "./catalog-compose";
import type { CatalogBackground } from "./catalog-pack";
import { creditCost, hasEnoughCredits } from "./credits";
import { uploadCatalogPack } from "./supabase/storage";
import { createServerClient } from "./supabase/server";
import type { Workflow } from "./types";

export type GenerateInput = {
  userId: string;
  workflow: "studio";
  background: CatalogBackground;
  cutoutPng: Buffer;
};

export type GenerateOk = { ok: true; id: string; outputPaths: string[]; creditsUsed: number };
export type GenerateErr = { ok: false; status: 400 | 401 | 402 | 500; message: string };

export type ProfileRow = { credits: number; plan: string };

export type CatalogPack = { shop: Buffer; story: Buffer; whatsapp: Buffer };

export type GenerationRepo = {
  getProfile(userId: string): Promise<ProfileRow | null>;
  insertRunning(userId: string, workflow: Workflow): Promise<{ id: string }>;
  markDone(id: string, outputPaths: string[], creditsUsed: number): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
  decrementCredits(userId: string, amount: number): Promise<void>;
};

export type GenerateOptions = {
  now?: () => Promise<void>;
  compose?: (cutoutPng: Buffer, background: CatalogBackground) => Promise<CatalogPack>;
  upload?: (args: {
    userId: string;
    jobId: string;
    pack: CatalogPack;
  }) => Promise<string[]>;
};

async function defaultUpload(args: {
  userId: string;
  jobId: string;
  pack: CatalogPack;
}): Promise<string[]> {
  const supabase = await createServerClient();
  return uploadCatalogPack({
    supabase,
    userId: args.userId,
    jobId: args.jobId,
    pack: args.pack,
  });
}

export async function executeGenerate(
  repo: GenerationRepo,
  input: GenerateInput,
  options?: GenerateOptions,
): Promise<GenerateOk | GenerateErr> {
  if (input.workflow !== "studio") {
    return { ok: false, status: 400, message: "Invalid workflow." };
  }

  const profile = await repo.getProfile(input.userId);
  if (!profile) {
    return { ok: false, status: 401, message: "Please sign in again." };
  }

  if (!hasEnoughCredits(profile.credits, input.workflow)) {
    return { ok: false, status: 402, message: "Not enough credits." };
  }

  const { id } = await repo.insertRunning(input.userId, input.workflow);
  if (options?.now) {
    await options.now();
  }

  const compose = options?.compose ?? composeCatalogPack;
  const upload = options?.upload ?? defaultUpload;

  try {
    const pack = await compose(input.cutoutPng, input.background);
    const outputPaths = await upload({
      userId: input.userId,
      jobId: id,
      pack,
    });
    const creditsUsed = creditCost(input.workflow);
    await repo.markDone(id, outputPaths, creditsUsed);
    await repo.decrementCredits(input.userId, creditsUsed);
    return { ok: true, id, outputPaths, creditsUsed };
  } catch {
    const message = "Generation failed. Try again.";
    await repo.markFailed(id, message);
    return { ok: false, status: 500, message };
  }
}
