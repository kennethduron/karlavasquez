import {
  createTestAdmin,
  deleteTestIdentities,
} from "./supabase-test-identities.mjs";

export default async function globalTeardown() {
  await deleteTestIdentities(createTestAdmin());
}
