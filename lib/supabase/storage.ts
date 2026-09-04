import type { SupabaseClient } from "@supabase/supabase-js";

import { CATALOG_OUTPUT_NAMES, type CatalogPreset } from "@/lib/catalog-pack";

const CATALOG_BUCKET = "catalog";
const UPLOAD_ORDER: CatalogPreset[] = ["shop", "story", "whatsapp"];

export function catalogObjectPath(
  userId: string,
  jobId: string,
  fileName: string,
): string {
  return `${userId}/${jobId}/${fileName}`;
}

export async function uploadCatalogPack(args: {
  supabase: SupabaseClient;
  userId: string;
  jobId: string;
  pack: { shop: Buffer; story: Buffer; whatsapp: Buffer };
}): Promise<string[]> {
  const { supabase, userId, jobId, pack } = args;
  const urls: string[] = [];

  for (const preset of UPLOAD_ORDER) {
    const fileName = CATALOG_OUTPUT_NAMES[preset];
    const path = catalogObjectPath(userId, jobId, fileName);
    const { error } = await supabase.storage
      .from(CATALOG_BUCKET)
      .upload(path, pack[preset], {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}
