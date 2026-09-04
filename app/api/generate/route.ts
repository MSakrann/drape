import { NextResponse } from "next/server";
import sharp from "sharp";

import { composeCatalogPack } from "@/lib/catalog-compose";
import type { CatalogBackground } from "@/lib/catalog-pack";
import { executeGenerate } from "@/lib/generate-service";
import {
  getUserId,
  supabaseGenerationRepo,
} from "@/lib/supabase/adapter";
import { createServerClient } from "@/lib/supabase/server";
import { uploadCatalogPack } from "@/lib/supabase/storage";

const BACKGROUNDS = new Set<CatalogBackground>(["white", "grey"]);

async function cutoutToPng(file: File): Promise<Buffer | null> {
  const bytes = Buffer.from(await file.arrayBuffer());
  if (file.type === "image/png") {
    return bytes;
  }
  if (file.type === "image/jpeg" || file.type === "image/jpg") {
    return sharp(bytes).png().toBuffer();
  }
  return null;
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid form data." },
      { status: 400 },
    );
  }

  const background = form.get("background");
  if (typeof background !== "string" || !BACKGROUNDS.has(background as CatalogBackground)) {
    return NextResponse.json(
      { message: "Invalid background." },
      { status: 400 },
    );
  }

  const cutout = form.get("cutout");
  if (!(cutout instanceof File) || cutout.size === 0) {
    return NextResponse.json(
      { message: "Invalid cutout." },
      { status: 400 },
    );
  }

  const cutoutPng = await cutoutToPng(cutout);
  if (!cutoutPng) {
    return NextResponse.json(
      { message: "Invalid cutout." },
      { status: 400 },
    );
  }

  const result = await executeGenerate(
    supabaseGenerationRepo(supabase),
    {
      userId,
      workflow: "studio",
      background: background as CatalogBackground,
      cutoutPng,
    },
    {
      compose: composeCatalogPack,
      upload: ({ userId, jobId, pack }) =>
        uploadCatalogPack({ supabase, userId, jobId, pack }),
    },
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
  });
}
