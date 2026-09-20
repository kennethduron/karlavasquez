import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Client,
  Consultation,
  LegalCase,
  LegalDocument,
  LegalEvent,
  LegalTask,
  Note,
  RoleDefinition,
} from "@/domain/entities";
import type {
  CaseRepository,
  ClientRepository,
  ConsultationRepository,
  DocumentRepository,
  EventRepository,
  NoteRepository,
  RoleRepository,
  TaskRepository,
} from "@/domain/repositories/business-repositories";

function date(value: string) {
  return new Date(value);
}

function fail(error: unknown): never {
  throw new Error(
    error ? "Supabase repository operation failed." : "Record missing.",
  );
}

type ConsultationRow = {
  id: string;
  human_id: string;
  full_name: string;
  email_original: string | null;
  phone_original: string | null;
  responsible_user_id: string | null;
  created_at: string;
  updated_at: string;
  status: { key: string } | null;
};

export class SupabaseConsultationRepository implements ConsultationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Consultation | null> {
    const { data, error } = await this.client
      .from("consultations")
      .select(
        "id,human_id,full_name,email_original,phone_original,responsible_user_id,created_at,updated_at,status:consultation_statuses!consultations_status_id_fkey(key)",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const row = data as unknown as ConsultationRow;
    return {
      id: row.id,
      humanId: row.human_id,
      fullName: row.full_name,
      email: row.email_original,
      phone: row.phone_original,
      status: row.status?.key ?? "unknown",
      responsibleUserId: row.responsible_user_id,
      createdAt: date(row.created_at),
      updatedAt: date(row.updated_at),
    };
  }
}

type ClientRow = {
  id: string;
  human_id: string;
  display_name: string;
  status: string;
  responsible_user_id: string | null;
  source_consultation_id: string | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseClientRepository implements ClientRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.client
      .from("clients")
      .select(
        "id,human_id,display_name,status,responsible_user_id,source_consultation_id,created_at,updated_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const row = data as ClientRow;
    return {
      id: row.id,
      humanId: row.human_id,
      displayName: row.display_name,
      status: row.status,
      responsibleUserId: row.responsible_user_id,
      sourceConsultationId: row.source_consultation_id,
      createdAt: date(row.created_at),
      updatedAt: date(row.updated_at),
    };
  }
}

type CaseRow = {
  id: string;
  human_id: string;
  client_id: string;
  title: string;
  responsible_user_id: string | null;
  created_at: string;
  updated_at: string;
  status: { key: string } | null;
  assignments: Array<{ user_id: string; ended_at: string | null }>;
};

export class SupabaseCaseRepository implements CaseRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<LegalCase | null> {
    const { data, error } = await this.client
      .from("cases")
      .select(
        "id,human_id,client_id,title,responsible_user_id,created_at,updated_at,status:case_statuses!cases_status_id_fkey(key),assignments:case_assignments!case_assignments_case_id_fkey(user_id,ended_at)",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const row = data as unknown as CaseRow;
    return {
      id: row.id,
      humanId: row.human_id,
      clientId: row.client_id,
      title: row.title,
      status: row.status?.key ?? "unknown",
      responsibleUserId: row.responsible_user_id,
      assignedUserIds: row.assignments
        .filter(({ ended_at }) => !ended_at)
        .map(({ user_id }) => user_id),
      createdAt: date(row.created_at),
      updatedAt: date(row.updated_at),
    };
  }
}

type DocumentRow = {
  id: string;
  case_id: string | null;
  client_id: string | null;
  category_id: string | null;
  title: string;
  status: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseDocumentRepository implements DocumentRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<LegalDocument | null> {
    const { data, error } = await this.client
      .from("documents")
      .select(
        "id,case_id,client_id,category_id,title,status,uploaded_by,created_at,updated_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const row = data as DocumentRow;
    const { data: version, error: versionError } = await this.client
      .from("document_versions")
      .select("original_filename,mime_type,size_bytes")
      .eq("document_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (versionError) fail(versionError);
    return {
      id: row.id,
      caseId: row.case_id,
      clientId: row.client_id,
      categoryId: row.category_id,
      name: version?.original_filename ?? row.title,
      mimeType: version?.mime_type ?? "application/octet-stream",
      size: version?.size_bytes ?? 0,
      status: row.status,
      createdBy: row.uploaded_by ?? "",
      createdAt: date(row.created_at),
      updatedAt: date(row.updated_at),
    };
  }
}

type TaskRow = {
  id: string;
  title: string;
  status: string;
  assigned_to: string | null;
  case_id: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseTaskRepository implements TaskRepository {
  constructor(private readonly client: SupabaseClient) {}
  async findById(id: string): Promise<LegalTask | null> {
    const { data, error } = await this.client
      .from("tasks")
      .select(
        "id,title,status,assigned_to,case_id,due_at,created_at,updated_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const row = data as TaskRow;
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      assignedTo: row.assigned_to,
      caseId: row.case_id,
      dueAt: row.due_at ? date(row.due_at) : null,
      createdAt: date(row.created_at),
      updatedAt: date(row.updated_at),
    };
  }
}

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  responsible_user_id: string | null;
  case_id: string | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseEventRepository implements EventRepository {
  constructor(private readonly client: SupabaseClient) {}
  async findById(id: string): Promise<LegalEvent | null> {
    const { data, error } = await this.client
      .from("events")
      .select(
        "id,title,starts_at,ends_at,responsible_user_id,case_id,created_at,updated_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const row = data as EventRow;
    return {
      id: row.id,
      title: row.title,
      startsAt: date(row.starts_at),
      endsAt: row.ends_at ? date(row.ends_at) : null,
      responsibleUserId: row.responsible_user_id,
      caseId: row.case_id,
      createdAt: date(row.created_at),
      updatedAt: date(row.updated_at),
    };
  }
}

type NoteRow = {
  id: string;
  author_id: string | null;
  body: string;
  consultation_id: string | null;
  client_id: string | null;
  case_id: string | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseNoteRepository implements NoteRepository {
  constructor(private readonly client: SupabaseClient) {}
  async findById(id: string): Promise<Note | null> {
    const { data, error } = await this.client
      .from("notes")
      .select(
        "id,author_id,body,consultation_id,client_id,case_id,created_at,updated_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const row = data as NoteRow;
    return {
      id: row.id,
      authorUid: row.author_id ?? "",
      body: row.body,
      consultationId: row.consultation_id,
      clientId: row.client_id,
      caseId: row.case_id,
      createdAt: date(row.created_at),
      updatedAt: date(row.updated_at),
    };
  }
}

type RoleRow = {
  key: string;
  name: string;
  updated_at: string;
  role_permissions: Array<{ permissions: { key: string } | null }>;
};

export class SupabaseRoleRepository implements RoleRepository {
  constructor(private readonly client: SupabaseClient) {}
  async findByKeys(keys: readonly string[]): Promise<RoleDefinition[]> {
    if (!keys.length) return [];
    const { data, error } = await this.client
      .from("roles")
      .select("key,name,updated_at,role_permissions(permissions(key))")
      .in("key", [...keys]);
    if (error) fail(error);
    return (data as unknown as RoleRow[]).map((row) => ({
      key: row.key,
      name: row.name,
      permissionKeys: row.role_permissions.flatMap(({ permissions }) =>
        permissions ? [permissions.key] : [],
      ),
      version: Math.max(1, Math.floor(date(row.updated_at).getTime() / 1000)),
    }));
  }
}
