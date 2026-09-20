import { createClient } from "@supabase/supabase-js";

export const testPassword = "Supabase-Test-2026!";
export const testIdentities = [
  { email: "lawyer@knv.test", status: "active", role: "lawyer" },
  { email: "recovery@knv.test", status: "active", role: "lawyer" },
  { email: "disabled@knv.test", status: "disabled" },
  { email: "orphan@knv.test", orphan: true },
];

export function createTestAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("Local Supabase test configuration is missing.");
  }
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function deleteTestIdentities(admin) {
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;
  const emails = new Set(testIdentities.map(({ email }) => email));
  for (const user of data.users.filter(({ email }) => emails.has(email))) {
    await admin.from("profiles").delete().eq("id", user.id);
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
  }
}
