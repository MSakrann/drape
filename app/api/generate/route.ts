import { NextResponse } from "next/server";

import { executeGenerate } from "@/lib/generate-service";
import {
  getUserId,
  supabaseGenerationRepo,
} from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import type { Workflow } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );
  }

  const { workflow } = (await request.json()) as { workflow: Workflow };
  const result = await executeGenerate(supabaseGenerationRepo(supabase), {
    userId,
    workflow,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
  });
}
