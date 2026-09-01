import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  const profile = data as { credits: number; plan: Plan };

  return NextResponse.json({
    credits: profile.credits,
    plan: profile.plan,
    email: user.email ?? "",
  });
}
