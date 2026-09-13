import type { UserProfile } from "@/domain/auth";

export interface UserRepository {
  findById(id: string): Promise<UserProfile | null>;
}
