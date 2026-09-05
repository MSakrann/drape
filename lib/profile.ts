import type { SupabaseClient } from "@supabase/supabase-js";

import type { Plan } from "@/lib/types";

export type ProfileRow = { credits: number; plan: Plan };

export type ProfileQueryResult =
  | { ok: true; profile: ProfileRow }
  | { ok: false; missing: boolean; message: string };

type ProfileQueryInput = {
  data: { credits: number; plan: string } | null;
  error: { code?: string; message: string } | null;
};

export function readProfileQuery(result: ProfileQueryInput): ProfileQueryResult {
  if (result.error?.code === "PGRST116" || (!result.error && !result.data)) {
    return { ok: false, missing: true, message: "Profile not found." };
  }

  if (result.error) {
    return { ok: false, missing: false, message: result.error.message };
  }

  if (!result.data) {
    return { ok: false, missing: true, message: "Profile not found." };
  }

  return {
    ok: true,
    profile: {
      credits: result.data.credits,
      plan: result.data.plan as Plan,
    },
  };
}

export async function loadOrCreateProfile(
  client: SupabaseClient,
  userId: string,
): Promise<ProfileQueryResult> {
  const existing = await client
    .from("profiles")
    .select("credits, plan")
    .eq("id", userId)
    .maybeSingle();

  const read = readProfileQuery(existing);
  if (read.ok || !read.missing) {
    return read;
  }

  const { data, error } = await client.rpc("ensure_profile");
  if (error) {
    return { ok: false, missing: false, message: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return readProfileQuery({
    data: row ? { credits: row.credits, plan: row.plan } : null,
    error: null,
  });
}
