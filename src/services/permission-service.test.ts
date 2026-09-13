import { describe, expect, it } from "vitest";
import type { UserProfile } from "@/domain/auth";
import type { RoleRepository } from "@/domain/repositories/business-repositories";
import { PermissionService } from "@/services/permission-service";

const profile: UserProfile = {
  id: "user-a",
  email: "user@knv.test",
  displayName: "Usuario",
  status: "active",
  roleKeys: ["lawyer"],
  effectivePermissions: ["cases.view", "documents.view"],
  permissionVersion: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PermissionService", () => {
  it("resolves permissions only when role and mirrored rule data agree", async () => {
    const roles: RoleRepository = {
      findByKeys: async () => [
        {
          key: "lawyer",
          name: "Abogado",
          version: 1,
          permissionKeys: ["documents.view", "cases.view"],
        },
      ],
    };
    await expect(
      new PermissionService(roles).resolve(profile),
    ).resolves.toEqual(["cases.view", "documents.view"]);
  });

  it("fails closed when the Firestore permission mirror is stale", async () => {
    const roles: RoleRepository = {
      findByKeys: async () => [
        {
          key: "lawyer",
          name: "Abogado",
          version: 1,
          permissionKeys: ["cases.view", "documents.view", "cases.view_all"],
        },
      ],
    };
    await expect(new PermissionService(roles).resolve(profile)).rejects.toThrow(
      "inconsistent",
    );
  });
});
