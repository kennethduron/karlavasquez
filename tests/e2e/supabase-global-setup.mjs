import {
  createTestAdmin,
  deleteTestIdentities,
  testIdentities,
  testPassword,
} from "./supabase-test-identities.mjs";

export default async function globalSetup() {
  const admin = createTestAdmin();
  await deleteTestIdentities(admin);

  const { data: lawyerRole, error: roleError } = await admin
    .from("roles")
    .select("id")
    .eq("key", "lawyer")
    .single();
  if (roleError) throw roleError;

  for (const identity of testIdentities) {
    const { data, error } = await admin.auth.admin.createUser({
      email: identity.email,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        display_name:
          identity.role === "lawyer" ? "Abogada de Prueba" : "Usuario temporal",
      },
    });
    if (error || !data.user) throw error ?? new Error("Unable to create user");

    if (identity.orphan) {
      const { error: deleteProfileError } = await admin
        .from("profiles")
        .delete()
        .eq("id", data.user.id);
      if (deleteProfileError) throw deleteProfileError;
      continue;
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ status: identity.status })
      .eq("id", data.user.id);
    if (profileError) throw profileError;

    if (identity.role) {
      const { error: membershipError } = await admin.from("user_roles").insert({
        user_id: data.user.id,
        role_id: lawyerRole.id,
      });
      if (membershipError) throw membershipError;
    }
  }
}
