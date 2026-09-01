import { redirect } from "next/navigation";

import { getUserId } from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";

export default async function ResultsPage() {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    redirect("/sign-in");
  }

  const { data, error } = await supabase
    .from("generations")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  redirect(data ? `/results/${data.id}` : "/generate");
}
