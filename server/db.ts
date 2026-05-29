import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, passcodes, partnerSalons, counselingSessions, InsertCounselingSession } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── パスコード認証 ──────────────────────────────────────────────────────────

export async function verifyPasscode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    id: passcodes.id,
    code: passcodes.code,
    type: passcodes.type,
    partnerSalonId: passcodes.partnerSalonId,
    label: passcodes.label,
    isActive: passcodes.isActive,
  }).from(passcodes).where(and(eq(passcodes.code, code), eq(passcodes.isActive, true))).limit(1);
  if (result.length === 0) return null;
  const pc = result[0];
  let salonName: string | null = null;
  if (pc.partnerSalonId) {
    const salon = await db.select({ name: partnerSalons.name }).from(partnerSalons).where(eq(partnerSalons.id, pc.partnerSalonId)).limit(1);
    salonName = salon.length > 0 ? salon[0].name : null;
  }
  return { ...pc, salonName };
}

// ── カウンセリングセッション ────────────────────────────────────────────────

export async function createCounselingSession(data: InsertCounselingSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(counselingSessions).values(data);
  return result;
}

export async function getCounselingSessions(options?: {
  partnerSalonId?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (options?.partnerSalonId !== undefined) {
    conditions.push(eq(counselingSessions.partnerSalonId, options.partnerSalonId));
  }
  const query = db.select().from(counselingSessions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(counselingSessions.createdAt))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);
  return await query;
}

export async function getCounselingSessionById(id: number, partnerSalonId?: number) {
  const db = await getDb();
  if (!db) return null;
  const conditions = [eq(counselingSessions.id, id)];
  if (partnerSalonId !== undefined) {
    conditions.push(eq(counselingSessions.partnerSalonId, partnerSalonId));
  }
  const result = await db.select().from(counselingSessions).where(and(...conditions)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTypeStats(partnerSalonId?: number) {
  const db = await getDb();
  if (!db) return { ecto: 0, meso: 0, endo: 0, unknown: 0, total: 0 };
  const conditions = partnerSalonId !== undefined
    ? [eq(counselingSessions.partnerSalonId, partnerSalonId)]
    : [];
  const rows = await db.select({
    primaryType: counselingSessions.primaryType,
    count: sql<number>`count(*)`,
  }).from(counselingSessions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(counselingSessions.primaryType);
  const stats = { ecto: 0, meso: 0, endo: 0, unknown: 0, total: 0 };
  for (const row of rows) {
    const c = Number(row.count);
    stats[row.primaryType as keyof typeof stats] = c;
    stats.total += c;
  }
  return stats;
}

export async function getChannelStats(partnerSalonId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = partnerSalonId !== undefined
    ? [eq(counselingSessions.partnerSalonId, partnerSalonId)]
    : [];
  return await db.select({
    accessChannel: counselingSessions.accessChannel,
    count: sql<number>`count(*)`,
  }).from(counselingSessions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(counselingSessions.accessChannel);
}

// ── パートナーサロン管理 ────────────────────────────────────────────────────

export async function getAllPartnerSalons() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(partnerSalons).orderBy(desc(partnerSalons.createdAt));
}

export async function getAllPasscodes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(passcodes).orderBy(desc(passcodes.createdAt));
}

export async function createPasscode(data: { code: string; type: "general" | "partner" | "admin"; partnerSalonId?: number; label?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(passcodes).values({ ...data, isActive: true });
}

export async function deactivatePasscode(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(passcodes).set({ isActive: false }).where(eq(passcodes.id, id));
}

export async function createPartnerSalon(data: { name: string; passcode: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(partnerSalons).values({ ...data, isActive: true });
  return result;
}
