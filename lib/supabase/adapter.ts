import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlanRepo } from "@/lib/choose-plan";
import type { GenerationRepo } from "@/lib/generate-service";
import type { Plan, Workflow } from "@/lib/types";

function throwIfError(error: { message: string } | null) {
  if (error) {
    throw error;
  }
}

export function supabaseGenerationRepo(
  client: SupabaseClient,
): GenerationRepo {
  return {
    async getProfile(userId) {
      const { data, error } = await client
        .from("profiles")
        .select("credits, plan")
        .eq("id", userId)
        .maybeSingle();

      throwIfError(error);
      return data ? { credits: data.credits, plan: data.plan } : null;
    },

    async insertRunning(userId, workflow: Workflow) {
      const { data, error } = await client
        .from("generations")
        .insert({
          user_id: userId,
          workflow,
          status: "running",
        })
        .select("id")
        .single();

      throwIfError(error);
      if (!data) {
        throw new Error("Supabase did not return the inserted generation.");
      }
      return { id: data.id };
    },

    async markDone(id, outputPaths, creditsUsed) {
      const { error } = await client
        .from("generations")
        .update({
          status: "done",
          output_paths: outputPaths,
          credits_used: creditsUsed,
          completed_at: new Date().toISOString(),
        })
        .eq("id", id);

      throwIfError(error);
    },

    async markFailed(id, errorMessage) {
      const { error } = await client
        .from("generations")
        .update({
          status: "failed",
          error_message: errorMessage,
        })
        .eq("id", id);

      throwIfError(error);
    },

    async decrementCredits(userId, amount) {
      const { data, error: readError } = await client
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single();

      throwIfError(readError);
      if (!data) {
        throw new Error("Supabase did not return the profile.");
      }

      const { error } = await client
        .from("profiles")
        .update({ credits: data.credits - amount })
        .eq("id", userId);

      throwIfError(error);
    },
  };
}

export function supabasePlanRepo(client: SupabaseClient): PlanRepo {
  return {
    async getPlanAndCredits(userId) {
      const { data, error } = await client
        .from("profiles")
        .select("plan, credits")
        .eq("id", userId)
        .maybeSingle();

      throwIfError(error);
      return data
        ? { plan: data.plan as Plan, credits: data.credits }
        : null;
    },

    async setPlan(userId, plan, nextCredits) {
      const { error } = await client
        .from("profiles")
        .update({ plan, credits: nextCredits })
        .eq("id", userId);

      throwIfError(error);
    },
  };
}

export async function getUserId(
  client: SupabaseClient,
): Promise<string | null> {
  const {
    data: { user },
  } = await client.auth.getUser();

  return user?.id ?? null;
}
