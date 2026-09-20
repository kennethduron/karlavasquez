import "server-only";

import { SupabaseAuthAdapter } from "@/infrastructure/supabase/auth";
import { SupabaseDatabaseAdapter } from "@/infrastructure/supabase/database";
import {
  SupabaseCaseRepository,
  SupabaseClientRepository,
  SupabaseConsultationRepository,
  SupabaseDocumentRepository,
  SupabaseEventRepository,
  SupabaseNoteRepository,
  SupabaseRoleRepository,
  SupabaseTaskRepository,
} from "@/infrastructure/supabase/repositories/business-repositories";
import { SupabasePrivateDocumentStorage } from "@/infrastructure/supabase/storage";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export async function createSupabaseRuntime() {
  const client = await createSupabaseServerClient();
  return {
    auth: new SupabaseAuthAdapter(client),
    database: new SupabaseDatabaseAdapter(client),
    storage: new SupabasePrivateDocumentStorage(client),
    consultations: new SupabaseConsultationRepository(client),
    clients: new SupabaseClientRepository(client),
    cases: new SupabaseCaseRepository(client),
    documents: new SupabaseDocumentRepository(client),
    tasks: new SupabaseTaskRepository(client),
    events: new SupabaseEventRepository(client),
    notes: new SupabaseNoteRepository(client),
    roles: new SupabaseRoleRepository(client),
  };
}
