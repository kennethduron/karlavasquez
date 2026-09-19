const results = [];

function configured(names) {
  return names.every((name) => Boolean(process.env[name]));
}

async function check(name, required, run) {
  if (!configured(required)) {
    results.push({ provider: name, status: "SKIPPED_NOT_CONFIGURED" });
    return;
  }

  try {
    await run();
    results.push({ provider: name, status: "PASS" });
  } catch {
    results.push({ provider: name, status: "FAIL" });
  }
}

await check(
  "Supabase",
  ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      },
    );
    if (!response.ok) throw new Error("Supabase unavailable");
  },
);

await check("Resend", ["RESEND_API_KEY"], async () => {
  const response = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  if (!response.ok) throw new Error("Resend unavailable");
});

await check(
  "Cloudinary",
  ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
  async () => {
    const credential = Buffer.from(
      `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`,
    ).toString("base64");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image?max_results=1`,
      { headers: { Authorization: `Basic ${credential}` } },
    );
    if (!response.ok) throw new Error("Cloudinary unavailable");
  },
);

await check(
  "Backblaze B2",
  ["B2_KEY_ID", "B2_APPLICATION_KEY", "B2_BUCKET_NAME"],
  async () => {
    const credential = Buffer.from(
      `${process.env.B2_KEY_ID}:${process.env.B2_APPLICATION_KEY}`,
    ).toString("base64");
    const authorization = await fetch(
      "https://api.backblazeb2.com/b2api/v4/b2_authorize_account",
      { headers: { Authorization: `Basic ${credential}` } },
    );
    if (!authorization.ok) throw new Error("Backblaze unavailable");
    const data = await authorization.json();
    if (
      data.allowed?.bucketName &&
      data.allowed.bucketName !== process.env.B2_BUCKET_NAME
    ) {
      throw new Error("Backblaze key is scoped to a different bucket");
    }
  },
);

for (const result of results) {
  console.log(`${result.provider}: ${result.status}`);
}

if (results.some((result) => result.status === "FAIL")) process.exitCode = 1;
