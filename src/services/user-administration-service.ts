import "server-only";

import type { RoleKey, ServerSession } from "@/domain/auth";
import type { AuditRepository } from "@/domain/repositories/audit-repository";
import type { RoleRepository } from "@/domain/repositories/business-repositories";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server";
import { getSiteUrl } from "@/lib/env/server";

function requireUserManagement(actor: ServerSession) {
  if (
    !actor.permissions.includes("*") &&
    !actor.permissions.includes("users.manage")
  ) {
    throw new Error("Permission denied.");
  }
}

export interface InvitationMailer {
  sendPasswordSetup(input: {
    to: string;
    displayName: string;
    passwordSetupLink: string;
  }): Promise<void>;
}

export class UserAdministrationService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly audit: AuditRepository,
    private readonly mailer: InvitationMailer,
  ) {}

  async invite(input: {
    actor: ServerSession;
    email: string;
    displayName: string;
    roleKey: RoleKey;
    requestId: string;
  }) {
    requireUserManagement(input.actor);
    const [role] = await this.roles.findByKeys([input.roleKey]);
    if (!role) throw new Error("Unknown role.");

    const admin = createSupabaseAdminClient();
    const { data: invitation, error: invitationError } =
      await admin.auth.admin.generateLink({
        type: "invite",
        email: input.email,
        options: {
          data: { display_name: input.displayName },
          redirectTo: `${getSiteUrl()}/auth/callback?next=/actualizar-contrasena`,
        },
      });
    if (
      invitationError ||
      !invitation.user ||
      !invitation.properties.action_link
    ) {
      throw new Error("Staff invitation could not be created.");
    }
    const userId = invitation.user.id;
    const { data: roleRecord, error: roleLookupError } = await admin
      .from("roles")
      .select("id")
      .eq("key", role.key)
      .single();
    if (roleLookupError || !roleRecord) {
      await admin.from("profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
      throw new Error("Staff role could not be resolved.");
    }
    const { error: membershipError } = await admin.from("user_roles").insert({
      user_id: userId,
      role_id: roleRecord.id,
    });
    if (membershipError) {
      await admin.from("profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
      throw new Error("Staff role could not be assigned.");
    }

    try {
      await this.mailer.sendPasswordSetup({
        to: input.email,
        displayName: input.displayName,
        passwordSetupLink: invitation.properties.action_link,
      });
    } catch (error) {
      await admin.from("profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
      await this.audit.append({
        actorUid: input.actor.uid,
        action: "auth.user_invited",
        entityType: "user",
        entityId: userId,
        occurredAt: new Date(),
        result: "failure",
        requestId: input.requestId,
        metadata: { roleKey: input.roleKey },
      });
      throw error;
    }

    await this.audit.append({
      actorUid: input.actor.uid,
      action: "auth.user_invited",
      entityType: "user",
      entityId: userId,
      occurredAt: new Date(),
      result: "success",
      requestId: input.requestId,
      metadata: { roleKey: input.roleKey },
    });
    return userId;
  }

  async disable(input: {
    actor: ServerSession;
    uid: string;
    requestId: string;
  }) {
    requireUserManagement(input.actor);
    const admin = createSupabaseAdminClient();
    const { error: profileError } = await admin
      .from("profiles")
      .update({ status: "disabled" })
      .eq("id", input.uid);
    const { error: authError } = await admin.auth.admin.updateUserById(
      input.uid,
      { ban_duration: "876000h" },
    );
    if (profileError || authError) throw new Error("User disable failed.");
    await this.audit.append({
      actorUid: input.actor.uid,
      action: "auth.user_disabled",
      entityType: "user",
      entityId: input.uid,
      occurredAt: new Date(),
      result: "success",
      requestId: input.requestId,
      metadata: {},
    });
  }
}
