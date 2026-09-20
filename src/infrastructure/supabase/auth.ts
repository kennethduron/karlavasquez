import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthPort } from "@/domain/integration-ports";
import { resolveSupabaseSession } from "@/infrastructure/supabase/authorization";
import { getSiteUrl } from "@/lib/env/server";

export class SupabaseAuthAdapter implements AuthPort {
  constructor(private readonly client: SupabaseClient) {}

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) throw new Error("Authentication failed.");
    if (!(await resolveSupabaseSession(this.client, data.user))) {
      await this.client.auth.signOut({ scope: "local" });
      throw new Error("Authorization failed.");
    }
  }

  async signOut() {
    const { error } = await this.client.auth.signOut({ scope: "local" });
    if (error) throw new Error("Logout failed.");
  }

  async requestPasswordRecovery(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/actualizar-contrasena`,
    });
    if (error) throw new Error("Password recovery request failed.");
  }
}
