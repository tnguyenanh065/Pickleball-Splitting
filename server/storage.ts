import { 
  type Member, 
  type InsertMember,
  type Session,
  type InsertSession,
  type SessionWithDetails,
  type Debt,
  type DebtWithMembers,
  type MemberFinancialSummary,
  type MemberLedger,
  members,
  sessions,
  sessionParticipants,
  debts,
} from "@shared/schema";
import { db } from "../db";
import { eq, sql, and, or, desc, ne } from "drizzle-orm";

export interface IStorage {
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, data: Partial<InsertMember>): Promise<Member | undefined>;
  
  getSessions(): Promise<SessionWithDetails[]>;
  getSession(id: string): Promise<SessionWithDetails | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  
  getDebts(memberId?: string): Promise<DebtWithMembers[]>;
  getDebtsByMember(memberId: string): Promise<DebtWithMembers[]>;
  settleDebt(debtId: string): Promise<Debt | undefined>;
  
  getMemberFinancialSummary(memberId: string): Promise<MemberFinancialSummary>;
  getMemberLedger(memberId: string): Promise<MemberLedger | undefined>;
}

export class DbStorage implements IStorage {
  async getMembers(): Promise<Member[]> {
    return await db.select().from(members).orderBy(members.name);
  }

  async getMember(id: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
    return result[0];
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const result = await db.insert(members).values(insertMember).returning();
    return result[0];
  }

  async updateMember(id: string, data: Partial<InsertMember>): Promise<Member | undefined> {
    const result = await db.update(members).set(data).where(eq(members.id, id)).returning();
    return result[0];
  }

  async getSessions(): Promise<SessionWithDetails[]> {
    const allSessions = await db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.date));

    const sessionsWithDetails = await Promise.all(
      allSessions.map(async (session) => {
        const payer = await this.getMember(session.payerId);
        
        const participantRecords = await db
          .select({ memberId: sessionParticipants.memberId })
          .from(sessionParticipants)
          .where(eq(sessionParticipants.sessionId, session.id));
        
        const participantsList = await Promise.all(
          participantRecords.map(async (p: { memberId: string }) => {
            const member = await this.getMember(p.memberId);
            return member!;
          })
        );

        return {
          ...session,
          payer: payer!,
          participants: participantsList,
          participantCount: participantsList.length,
        };
      })
    );

    return sessionsWithDetails;
  }

  async getSession(id: string): Promise<SessionWithDetails | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    if (!result[0]) return undefined;

    const session = result[0];
    const payer = await this.getMember(session.payerId);
    
    const participantRecords = await db
      .select({ memberId: sessionParticipants.memberId })
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, session.id));
    
    const participantsList = await Promise.all(
      participantRecords.map(async (p: { memberId: string }) => {
        const member = await this.getMember(p.memberId);
        return member!;
      })
    );

    return {
      ...session,
      payer: payer!,
      participants: participantsList,
      participantCount: participantsList.length,
    };
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const { participantIds, ...sessionData } = insertSession;
    
    return await db.transaction(async (tx) => {
      const [newSession] = await tx.insert(sessions).values(sessionData).returning();
      
      const shareAmount = (parseFloat(sessionData.totalCost) / participantIds.length).toFixed(2);
      
      const participantValues = participantIds.map((memberId) => ({
        sessionId: newSession.id,
        memberId,
        shareAmount,
      }));
      
      await tx.insert(sessionParticipants).values(participantValues);
      
      const debtValues = participantIds
        .filter((memberId) => memberId !== sessionData.payerId)
        .map((memberId) => ({
          sessionId: newSession.id,
          fromMemberId: memberId,
          toMemberId: sessionData.payerId,
          amount: shareAmount,
        }));
      
      if (debtValues.length > 0) {
        await tx.insert(debts).values(debtValues);
      }
      
      return newSession;
    });
  }

  async getDebts(memberId?: string): Promise<DebtWithMembers[]> {
    let query = db
      .select()
      .from(debts)
      .orderBy(desc(debts.createdAt));
    
    if (memberId) {
      query = query.where(
        or(
          eq(debts.fromMemberId, memberId),
          eq(debts.toMemberId, memberId)
        )
      ) as typeof query;
    }

    const allDebts = await query;

    const debtsWithMembers = await Promise.all(
      allDebts.map(async (debt) => {
        const fromMember = await this.getMember(debt.fromMemberId);
        const toMember = await this.getMember(debt.toMemberId);
        
        return {
          ...debt,
          fromMember: fromMember!,
          toMember: toMember!,
        };
      })
    );

    return debtsWithMembers;
  }

  async getDebtsByMember(memberId: string): Promise<DebtWithMembers[]> {
    return this.getDebts(memberId);
  }

  async settleDebt(debtId: string): Promise<Debt | undefined> {
    return await db.transaction(async (tx) => {
      const [updatedDebt] = await tx
        .update(debts)
        .set({ status: "paid" })
        .where(eq(debts.id, debtId))
        .returning();
      
      if (!updatedDebt) return undefined;

      const remainingDebts = await tx
        .select()
        .from(debts)
        .where(
          and(
            eq(debts.sessionId, updatedDebt.sessionId),
            eq(debts.status, "pending")
          )
        );

      if (remainingDebts.length === 0) {
        await tx
          .update(sessions)
          .set({ status: "settled" })
          .where(eq(sessions.id, updatedDebt.sessionId));
      }

      return updatedDebt;
    });
  }

  async getMemberFinancialSummary(memberId: string): Promise<MemberFinancialSummary> {
    const toReceiveResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${debts.amount}), 0)`,
      })
      .from(debts)
      .where(
        and(
          eq(debts.toMemberId, memberId),
          eq(debts.status, "pending")
        )
      );

    const toPayResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${debts.amount}), 0)`,
      })
      .from(debts)
      .where(
        and(
          eq(debts.fromMemberId, memberId),
          eq(debts.status, "pending")
        )
      );

    const toReceive = toReceiveResult[0]?.total || "0";
    const toPay = toPayResult[0]?.total || "0";
    const netPosition = (parseFloat(toReceive) - parseFloat(toPay)).toFixed(2);

    return {
      memberId,
      toReceive,
      toPay,
      netPosition,
    };
  }

  async getMemberLedger(memberId: string): Promise<MemberLedger | undefined> {
    const member = await this.getMember(memberId);
    if (!member) return undefined;

    const summary = await this.getMemberFinancialSummary(memberId);
    const allDebts = await this.getDebts(memberId);

    const debtsOwed = allDebts.filter(d => d.toMemberId === memberId && d.status === "pending");
    const debtsOwing = allDebts.filter(d => d.fromMemberId === memberId && d.status === "pending");

    return {
      member,
      summary,
      debtsOwed,
      debtsOwing,
    };
  }
}

export const storage = new DbStorage();
