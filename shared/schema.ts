import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).notNull(),
  payerId: varchar("payer_id").references(() => members.id).notNull(),
  status: text("status", { enum: ["pending", "settled"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionParticipants = pgTable("session_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
  memberId: varchar("member_id").references(() => members.id).notNull(),
  shareAmount: numeric("share_amount", { precision: 12, scale: 2 }).notNull(),
});

export const debts = pgTable("debts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
  fromMemberId: varchar("from_member_id").references(() => members.id).notNull(),
  toMemberId: varchar("to_member_id").references(() => members.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "paid"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  status: true,
}).extend({
  date: z.coerce.date(),
  participantIds: z.array(z.string()),
});

export const insertDebtSchema = createInsertSchema(debts).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type SessionParticipant = typeof sessionParticipants.$inferSelect;

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = z.infer<typeof insertDebtSchema>;

// Extended types for API responses
export type SessionWithDetails = Session & {
  payer: Member;
  participants: Member[];
  participantCount: number;
};

export type DebtWithMembers = Debt & {
  fromMember: Member;
  toMember: Member;
};

export type MemberFinancialSummary = {
  memberId: string;
  toReceive: string;
  toPay: string;
  netPosition: string;
};

export type MemberLedger = {
  member: Member;
  summary: MemberFinancialSummary;
  debtsOwed: DebtWithMembers[];
  debtsOwing: DebtWithMembers[];
};
