import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrivateDocumentStoragePort } from "@/domain/integration-ports";

const BUCKET = "legal-documents";
const MAX_BYTES = 25 * 1024 * 1024;
const PATH_PATTERN =
  /^(cases|clients)\/[0-9a-f-]{36}\/documents\/[0-9a-f-]{36}\/[0-9a-f-]{36}-[^/]+$/i;
const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "application/pdf": ["pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "docx",
  ],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

function validatePath(path: string) {
  if (!PATH_PATTERN.test(path))
    throw new Error("Invalid private document path.");
}

function validateContent(
  path: string,
  content: Uint8Array,
  contentType: string,
) {
  validatePath(path);
  if (content.byteLength < 1 || content.byteLength > MAX_BYTES) {
    throw new Error("Invalid private document size.");
  }
  const extensions = MIME_EXTENSIONS[contentType];
  const extension = path.split(".").at(-1)?.toLowerCase();
  if (!extensions?.includes(extension ?? "")) {
    throw new Error("Invalid private document type.");
  }

  const signatureMatches =
    (contentType === "application/pdf" &&
      new TextDecoder().decode(content.subarray(0, 5)) === "%PDF-") ||
    (contentType === "image/jpeg" &&
      content[0] === 0xff &&
      content[1] === 0xd8 &&
      content[2] === 0xff) ||
    (contentType === "image/png" &&
      content[0] === 0x89 &&
      new TextDecoder().decode(content.subarray(1, 4)) === "PNG") ||
    (contentType === "image/webp" &&
      new TextDecoder().decode(content.subarray(0, 4)) === "RIFF" &&
      new TextDecoder().decode(content.subarray(8, 12)) === "WEBP") ||
    (contentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      content[0] === 0x50 &&
      content[1] === 0x4b);
  if (!signatureMatches)
    throw new Error("Document signature does not match MIME.");
}

export class SupabasePrivateDocumentStorage implements PrivateDocumentStoragePort {
  readonly status = "available" as const;

  constructor(private readonly client: SupabaseClient) {}

  async put(path: string, content: Uint8Array, contentType: string) {
    validateContent(path, content, contentType);
    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, content, {
        contentType,
        upsert: false,
      });
    if (error) throw new Error("Private document upload failed.");
  }

  async get(path: string) {
    validatePath(path);
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .download(path);
    if (error || !data) throw new Error("Private document download failed.");
    return new Uint8Array(await data.arrayBuffer());
  }

  async remove(path: string) {
    validatePath(path);
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .remove([path]);
    if (error || data.length !== 1) {
      throw new Error("Private document delete failed.");
    }
  }

  async createSignedDownloadUrl(path: string, expiresInSeconds = 60) {
    validatePath(path);
    if (expiresInSeconds < 15 || expiresInSeconds > 300) {
      throw new Error("Invalid signed URL lifetime.");
    }
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresInSeconds);
    if (error || !data.signedUrl) {
      throw new Error("Private document authorization failed.");
    }
    return data.signedUrl;
  }
}
