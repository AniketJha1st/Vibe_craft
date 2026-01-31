console.log("Entering server/storage.ts...");

import { db } from "./db";
import {
  game_users as users, chains, stakes, predictions,
  type User, type Chain, type Stake, type Prediction,
  type CreateStakeRequest, type CreatePredictionRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByAuthId(authId: string): Promise<User | undefined>;
  createUser(user: { authId: string, username: string, email?: string | null }): Promise<User>;
  updateUserMiningPower(userId: number, power: number): Promise<User>;
  updateUserTokens(userId: number, tokens: number): Promise<User>;

  // Chains
  getChains(): Promise<Chain[]>;
  getChain(id: number): Promise<Chain | undefined>;
  updateChainStats(id: number, stats: Partial<Chain>): Promise<Chain>;
  createChain(chain: Omit<Chain, "id">): Promise<Chain>;

  // Stakes
  createStake(stake: CreateStakeRequest): Promise<Stake>;
  getUserStakes(userId: number): Promise<Stake[]>;

  // Predictions
  createPrediction(prediction: CreatePredictionRequest): Promise<Prediction>;
  getPredictions(): Promise<Prediction[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.authId, authId));
    return user;
  }

  async createUser(user: { authId: string, username: string, email?: string | null }): Promise<User> {
    const [newUser] = await db.insert(users).values({
      authId: user.authId,
      username: user.username,
      email: user.email || undefined
    }).returning();
    return newUser;
  }

  async updateUserMiningPower(userId: number, power: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ miningPower: power })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserTokens(userId: number, tokens: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ tokens })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Chains
  async getChains(): Promise<Chain[]> {
    return await db.select().from(chains).orderBy(chains.id);
  }

  async getChain(id: number): Promise<Chain | undefined> {
    const [chain] = await db.select().from(chains).where(eq(chains.id, id));
    return chain;
  }

  async updateChainStats(id: number, stats: Partial<Chain>): Promise<Chain> {
    const [chain] = await db.update(chains)
      .set(stats)
      .where(eq(chains.id, id))
      .returning();
    return chain;
  }

  async createChain(chain: Omit<Chain, "id">): Promise<Chain> {
    const [newChain] = await db.insert(chains).values(chain).returning();
    return newChain;
  }

  // Stakes
  async createStake(stake: CreateStakeRequest): Promise<Stake> {
    const [newStake] = await db.insert(stakes).values(stake).returning();
    return newStake;
  }

  async getUserStakes(userId: number): Promise<Stake[]> {
    return await db.select().from(stakes).where(eq(stakes.userId, userId));
  }

  // Predictions
  async createPrediction(prediction: CreatePredictionRequest): Promise<Prediction> {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }

  async getPredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions).orderBy(desc(predictions.createdAt)).limit(50);
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chains: Map<number, Chain>;
  private stakes: Map<number, Stake>;
  private predictions: Map<number, Prediction>;
  private currentUserId: number;
  private currentChainId: number;
  private currentStakeId: number;
  private currentPredictionId: number;

  constructor() {
    this.users = new Map();
    this.chains = new Map();
    this.stakes = new Map();
    this.predictions = new Map();
    this.currentUserId = 1;
    this.currentChainId = 1;
    this.currentStakeId = 1;
    this.currentPredictionId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.authId === authId);
  }

  async createUser(user: { authId: string, username: string, email?: string | null }): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = {
      ...user,
      id,
      miningPower: 0,
      tokens: 0,
      createdAt: new Date(),
      experience: 0,
      email: user.email || null // Ensure null if undefined
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserMiningPower(userId: number, power: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, miningPower: power };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserTokens(userId: number, tokens: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, tokens };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Chains
  async getChains(): Promise<Chain[]> {
    return Array.from(this.chains.values());
  }

  async getChain(id: number): Promise<Chain | undefined> {
    return this.chains.get(id);
  }

  async updateChainStats(id: number, stats: Partial<Chain>): Promise<Chain> {
    const chain = this.chains.get(id);
    if (!chain) throw new Error("Chain not found");
    const updatedChain = { ...chain, ...stats };
    this.chains.set(id, updatedChain);
    return updatedChain;
  }

  async createChain(chain: Omit<Chain, "id">): Promise<Chain> {
    const id = this.currentChainId++;
    const newChain: Chain = { ...chain, id };
    this.chains.set(id, newChain);
    return newChain;
  }

  // Stakes
  async createStake(stake: CreateStakeRequest): Promise<Stake> {
    const id = this.currentStakeId++;
    const newStake: Stake = { ...stake, id, status: "active", createdAt: new Date() };
    this.stakes.set(id, newStake);
    return newStake;
  }

  async getUserStakes(userId: number): Promise<Stake[]> {
    return Array.from(this.stakes.values()).filter(s => s.userId === userId);
  }

  // Predictions
  async createPrediction(prediction: CreatePredictionRequest): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const newPrediction: Prediction = { ...prediction, id, status: "pending", createdAt: new Date() };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }

  async getPredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Assuming date is set
  }
}

// Force MemStorage for now to ensure the app can start despite the network block.
export const storage = new MemStorage();
// export const storage = db ? new DatabaseStorage() : new MemStorage();

