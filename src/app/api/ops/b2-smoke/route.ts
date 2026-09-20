import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

const bucketName = "knv-bufete-legal-backups";

export function GET() {
  return new Response(
    `<!doctype html><html lang="es"><meta charset="utf-8"><title>KNV infrastructure smoke</title><body><label>Token <input id="token" type="password" autocomplete="off"></label><button id="b2">B2</button><button id="resend">Resend</button><pre id="result">READY</pre><script>
const token=document.getElementById('token');const result=document.getElementById('result');
async function run(path){result.textContent='RUNNING';const response=await fetch(path,{method:'POST',headers:{'x-knv-smoke-token':token.value}});result.textContent=JSON.stringify(await response.json());}
document.getElementById('b2').onclick=()=>run('/api/ops/b2-smoke');
document.getElementById('resend').onclick=()=>run('/api/ops/resend-smoke');
</script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

async function apiPost(
  url: string,
  token: string,
  body: Record<string, string>,
) {
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`B2 API ${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

export async function POST(request: NextRequest) {
  const expected = process.env.B2_SMOKE_TOKEN;
  if (!expected || request.headers.get("x-knv-smoke-token") !== expected) {
    return NextResponse.json({ status: "DENY" }, { status: 404 });
  }

  const keyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;
  if (!keyId || !applicationKey) {
    return NextResponse.json(
      { status: "FAIL", stage: "configuration" },
      { status: 500 },
    );
  }

  let uploadedFileId: string | undefined;
  let authorizationToken = "";
  let apiUrl = "";
  let remoteName = "";
  try {
    const basic = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");
    const authResponse = await fetch(
      "https://api.backblazeb2.com/b2api/v4/b2_authorize_account",
      { headers: { Authorization: `Basic ${basic}` }, cache: "no-store" },
    );
    if (!authResponse.ok) throw new Error(`authorize ${authResponse.status}`);
    const auth = (await authResponse.json()) as {
      authorizationToken: string;
      apiInfo?: {
        storageApi?: {
          apiUrl: string;
          downloadUrl: string;
          allowed?: {
            bucketId?: string;
            bucketName?: string;
            capabilities?: string[];
          };
        };
      };
    };
    const storage = auth.apiInfo?.storageApi;
    const allowed = storage?.allowed;
    if (!storage || !allowed?.bucketId || allowed.bucketName !== bucketName) {
      throw new Error("bucket scope");
    }
    authorizationToken = auth.authorizationToken;
    apiUrl = storage.apiUrl;

    const content = Buffer.from(
      `KNV controlled B2 smoke ${new Date().toISOString()}\n`,
    );
    const sha1 = createHash("sha1").update(content).digest("hex");
    const sha256 = createHash("sha256").update(content).digest("hex");
    remoteName = `phase-2-4b/controlled/${crypto.randomUUID()}.txt`;
    const uploadTarget = (await apiPost(
      `${apiUrl}/b2api/v3/b2_get_upload_url`,
      authorizationToken,
      { bucketId: allowed.bucketId },
    )) as { uploadUrl: string; authorizationToken: string };
    const upload = await fetch(uploadTarget.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadTarget.authorizationToken,
        "Content-Type": "text/plain",
        "Content-Length": String(content.length),
        "X-Bz-Content-Sha1": sha1,
        "X-Bz-File-Name": remoteName
          .split("/")
          .map(encodeURIComponent)
          .join("/"),
        "X-Bz-Info-Sha256": sha256,
      },
      body: content,
      cache: "no-store",
    });
    if (!upload.ok) throw new Error(`upload ${upload.status}`);
    const uploaded = (await upload.json()) as { fileId?: string };
    uploadedFileId = uploaded.fileId;

    const download = await fetch(
      `${storage.downloadUrl}/file/${bucketName}/${remoteName
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`,
      { headers: { Authorization: authorizationToken }, cache: "no-store" },
    );
    if (!download.ok) throw new Error(`download ${download.status}`);
    const restored = Buffer.from(await download.arrayBuffer());
    const checksumValid =
      restored.length === content.length &&
      createHash("sha256").update(restored).digest("hex") === sha256;
    if (!checksumValid) throw new Error("checksum");

    await apiPost(
      `${apiUrl}/b2api/v3/b2_delete_file_version`,
      authorizationToken,
      { fileName: remoteName, fileId: uploadedFileId ?? "" },
    );
    uploadedFileId = undefined;

    return NextResponse.json({
      status: "PASS",
      bucketScope: `${bucketName} ONLY`,
      capabilities: allowed.capabilities ?? [],
      write: true,
      read: true,
      checksumValid: true,
      temporaryObjectRemoved: true,
    });
  } catch {
    if (uploadedFileId && authorizationToken && apiUrl && remoteName) {
      await apiPost(
        `${apiUrl}/b2api/v3/b2_delete_file_version`,
        authorizationToken,
        { fileName: remoteName, fileId: uploadedFileId },
      ).catch(() => undefined);
    }
    return NextResponse.json({ status: "FAIL" }, { status: 500 });
  }
}
