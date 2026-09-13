import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import type { RoleKey, ServerSession } from "@/domain/auth";
import type { AuditRepository } from "@/domain/repositories/audit-repository";
import type { RoleRepository } from "@/domain/repositories/business-repositories";
import {
  getAdminAuth,
  getAdminFirestore,
} from "@/infrastructure/firebase/admin";
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

    const auth = getAdminAuth();
    const user = await auth.createUser({
      email: input.email,
      displayName: input.displayName,
      emailVerified: false,
    });
    await auth.setCustomUserClaims(user.uid, {
      roleKeys: [input.roleKey],
      permissionVersion: role.version,
      administrator: input.roleKey === "administrator",
    });

    const now = Timestamp.now();
    await getAdminFirestore()
      .collection("users")
      .doc(user.uid)
      .set({
        email: input.email.toLowerCase(),
        displayName: input.displayName,
        status: "active",
        roleKeys: [input.roleKey],
        effectivePermissions: role.permissionKeys,
        permissionVersion: role.version,
        locale: "es-HN",
        timezone: "America/Tegucigalpa",
        createdAt: now,
        updatedAt: now,
      });

    try {
      const passwordSetupLink = await auth.generatePasswordResetLink(
        input.email,
        { url: `${getSiteUrl()}/actualizar-contrasena` },
      );
      await this.mailer.sendPasswordSetup({
        to: input.email,
        displayName: input.displayName,
        passwordSetupLink,
      });
    } catch (error) {
      await Promise.all([
        auth.updateUser(user.uid, { disabled: true }),
        getAdminFirestore().collection("users").doc(user.uid).update({
          status: "invited",
          updatedAt: Timestamp.now(),
        }),
      ]);
      await this.audit.append({
        actorUid: input.actor.uid,
        action: "auth.user_invited",
        entityType: "user",
        entityId: user.uid,
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
      entityId: user.uid,
      occurredAt: new Date(),
      result: "success",
      requestId: input.requestId,
      metadata: { roleKey: input.roleKey },
    });
    return user.uid;
  }

  async disable(input: {
    actor: ServerSession;
    uid: string;
    requestId: string;
  }) {
    requireUserManagement(input.actor);
    const userRef = getAdminFirestore().collection("users").doc(input.uid);
    await userRef.update({ status: "disabled", updatedAt: Timestamp.now() });
    await getAdminAuth().updateUser(input.uid, { disabled: true });
    await getAdminAuth().revokeRefreshTokens(input.uid);
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
