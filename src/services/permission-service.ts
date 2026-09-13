import type { UserProfile } from "@/domain/auth";
import type { RoleRepository } from "@/domain/repositories/business-repositories";

export class PermissionService {
  constructor(private readonly roles: RoleRepository) {}

  async resolve(profile: UserProfile): Promise<string[]> {
    const roles = await this.roles.findByKeys(profile.roleKeys);
    if (
      roles.length !== profile.roleKeys.length ||
      roles.some((role) => role.version !== profile.permissionVersion)
    ) {
      throw new Error("Authorization data is stale.");
    }

    const calculated = [
      ...new Set(roles.flatMap((role) => role.permissionKeys)),
    ].sort();
    const mirrored = [...profile.effectivePermissions].sort();
    if (JSON.stringify(calculated) !== JSON.stringify(mirrored)) {
      throw new Error("Authorization mirror is inconsistent.");
    }
    return calculated;
  }

  allows(granted: readonly string[], required: string) {
    return granted.includes("*") || granted.includes(required);
  }
}
