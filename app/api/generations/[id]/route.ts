import { NextResponse } from "next/server";

import { getUserId } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, workflow, status, credits_used, input_path, output_paths, error_message, created_at, completed_at",
    )
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return NextResponse.json(
      { message: "Generation not found." },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}
