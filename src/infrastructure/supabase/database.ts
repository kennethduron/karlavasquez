import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DatabasePort } from "@/domain/integration-ports";

export class SupabaseDatabaseAdapter implements DatabasePort {
  constructor(private readonly client: SupabaseClient) {}

  async healthCheck() {
    const { count, error } = await this.client
      .from("roles")
      .select("id", { count: "exact", head: true });
    return !error && typeof count === "number" && count >= 4;
  }
}
