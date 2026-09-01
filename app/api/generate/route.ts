import { NextResponse } from "next/server";

import { executeGenerate } from "@/lib/generate-service";
import {
  getUserId,
  supabaseGenerationRepo,
} from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import type { Workflow } from "@/lib/types";

const WORKFLOWS: Workflow[] = [
  "studio",
  "tryon",
  "lifestyle",
  "video",
  "variants",
];

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

  const workflow =
    typeof body === "object" && body !== null && "workflow" in body
      ? (body as { workflow?: unknown }).workflow
      : undefined;

  if (
    typeof workflow !== "string" ||
    !WORKFLOWS.includes(workflow as Workflow)
  ) {
    return NextResponse.json(
      { message: "Invalid workflow." },
      { status: 400 },
    );
  }

  const result = await executeGenerate(supabaseGenerationRepo(supabase), {
    userId,
    workflow: workflow as Workflow,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
  });
}
