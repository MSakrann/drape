import { NextResponse } from "next/server";

import { executeChoosePlan } from "@/lib/choose-plan";
import { getUserId, supabasePlanRepo } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types";

type PaidPlan = Exclude<Plan, "trial">;

const PAID_PLANS: PaidPlan[] = ["starter", "pro", "business", "agency"];

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const plan =
    typeof body === "object" && body !== null && "plan" in body
      ? (body as { plan?: unknown }).plan
      : undefined;

  if (typeof plan !== "string" || !PAID_PLANS.includes(plan as PaidPlan)) {
    return NextResponse.json(
      { message: "Invalid plan." },
      { status: 400 },
    );
  }

  const result = await executeChoosePlan(
    supabasePlanRepo(supabase),
    userId,
    plan as PaidPlan,
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
  });
}
