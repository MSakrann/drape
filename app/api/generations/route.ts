import { NextResponse } from "next/server";

import { getUserId } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("generations")
    .select("id, workflow, status, output_paths, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw error;
  }

  return NextResponse.json(data ?? []);
}
