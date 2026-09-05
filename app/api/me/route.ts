import { NextResponse } from "next/server";

import { loadOrCreateProfile } from "@/lib/profile";
import { createServerClient } from "@/lib/supabase/server";

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

  const profile = await loadOrCreateProfile(supabase, user.id);

  if (!profile.ok) {
    return NextResponse.json({ message: profile.message }, { status: 500 });
  }

  return NextResponse.json({
    credits: profile.profile.credits,
    plan: profile.profile.plan,
    email: user.email ?? "",
  });
}
