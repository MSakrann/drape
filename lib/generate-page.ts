import type { Workflow } from "./types";

export type UploadCandidate = {
  type: string;
  size: number;
};

export const UPLOAD_ERROR = "Use a JPEG or PNG up to 10MB.";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const WORKFLOW_TABS: { workflow: Workflow; label: string }[] = [
  { workflow: "studio", label: "Catalog pack" },
];

export const WORKFLOW_OPTIONS = {
  studio: ["white", "grey"],
} as const;

export function validateUpload(file: UploadCandidate): string | null {
  if (!file.type.startsWith("image/") || file.size > MAX_UPLOAD_BYTES) {
    return UPLOAD_ERROR;
  }

  return null;
}
