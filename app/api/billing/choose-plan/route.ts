import { NextResponse } from "next/server";

import { executeChoosePlan } from "@/lib/choose-plan";
import { getUserId, supabasePlanRepo } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );
  }

  const { plan } = (await request.json()) as { plan: Plan };
  const result = await executeChoosePlan(
    supabasePlanRepo(supabase),
    userId,
    plan,
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
  });
}
