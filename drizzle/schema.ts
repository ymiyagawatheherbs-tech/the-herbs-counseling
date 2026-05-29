import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * パートナーサロンテーブル
 * パートナーサロンの情報を管理する
 */
export const partnerSalons = mysqlTable("partner_salons", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  passcode: varchar("passcode", { length: 32 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerSalon = typeof partnerSalons.$inferSelect;
export type InsertPartnerSalon = typeof partnerSalons.$inferInsert;

/**
 * パスコードテーブル
 * 一般用・パートナーサロン用・管理者用のパスコードを管理する
 */
export const passcodes = mysqlTable("passcodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  type: mysqlEnum("type", ["general", "partner", "admin"]).notNull(),
  partnerSalonId: int("partnerSalonId"),
  label: varchar("label", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Passcode = typeof passcodes.$inferSelect;
export type InsertPasscode = typeof passcodes.$inferInsert;

/**
 * カウンセリングセッションテーブル
 * お客様の診断結果・回答内容を保存する
 */
export const counselingSessions = mysqlTable("counseling_sessions", {
  id: int("id").autoincrement().primaryKey(),
  // お客様情報
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientKana: varchar("clientKana", { length: 255 }),
  clientDob: varchar("clientDob", { length: 20 }),
  clientJob: varchar("clientJob", { length: 255 }),
  clientAddress: varchar("clientAddress", { length: 500 }),
  clientTel: varchar("clientTel", { length: 50 }),
  clientMobile: varchar("clientMobile", { length: 50 }),
  // 体質チェック結果
  ectoScore: int("ectoScore").default(0).notNull(),
  mesoScore: int("mesoScore").default(0).notNull(),
  endoScore: int("endoScore").default(0).notNull(),
  primaryType: mysqlEnum("primaryType", ["ecto", "meso", "endo", "unknown"]).default("unknown").notNull(),
  // 詳細回答（JSON）
  ectoChecked: json("ectoChecked"),       // 外胚葉型チェック項目
  mesoChecked: json("mesoChecked"),       // 中胚葉型チェック項目
  endoChecked: json("endoChecked"),       // 内胚葉型チェック項目
  symptoms: json("symptoms"),             // 身体の症状
  hairChildType: varchar("hairChildType", { length: 50 }),  // 子供の頃の髪質
  hairTroubles: json("hairTroubles"),     // 髪・頭皮のトラブル
  colorHistory: varchar("colorHistory", { length: 500 }),   // カラー・パーマ歴
  hasMedication: boolean("hasMedication").default(false),
  medicationDetail: text("medicationDetail"),
  hasPollen: boolean("hasPollen").default(false),
  pollenTypes: json("pollenTypes"),
  lifestyleHabits: json("lifestyleHabits"),
  foodNotes: text("foodNotes"),
  hasIllness: boolean("hasIllness").default(false),
  illnessDetail: text("illnessDetail"),
  visitReason: varchar("visitReason", { length: 100 }),
  request: text("request"),
  // アクセス経路
  accessChannel: mysqlEnum("accessChannel", ["store", "sns", "line", "web", "other"]).default("other").notNull(),
  // パートナーサロン情報
  partnerSalonId: int("partnerSalonId"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CounselingSession = typeof counselingSessions.$inferSelect;
export type InsertCounselingSession = typeof counselingSessions.$inferInsert;
