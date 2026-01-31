import { users, type AuthUser as User, type UpsertAuthUser as UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  private users = new Map<string, User>();

  async getUser(id: string): Promise<User | undefined> {
    // Force memory for now to avoid database connection reset on Windows
    return this.users.get(id);
    /*
    if (!db) {
      return this.users.get(id);
    }
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
    */
  }


  async upsertUser(userData: UpsertUser): Promise<User> {
    // Force memory for now to avoid database connection reset on Windows
    if (!userData.id) throw new Error("User ID is required for in-memory storage");
    const existing = this.users.get(userData.id);

    const updated: User = {
      id: userData.id,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      email: userData.email ?? existing?.email ?? null,
      firstName: userData.firstName ?? existing?.firstName ?? null,
      lastName: userData.lastName ?? existing?.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? existing?.profileImageUrl ?? null
    };

    this.users.set(userData.id, updated);
    return updated;
    /*
    if (!db) {
      ...
    }
    const [user] = await db...
    return user;
    */
  }

}

export const authStorage = new AuthStorage();
