import type { 
  Member, 
  InsertMember,
  SessionWithDetails, 
  InsertSession,
  DebtWithMembers,
  MemberFinancialSummary,
  MemberLedger,
  Debt
} from "@shared/schema";

const API_BASE = "/api";

export async function fetchMembers(): Promise<Member[]> {
  const response = await fetch(`${API_BASE}/members`);
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

export async function fetchMember(id: string): Promise<Member> {
  const response = await fetch(`${API_BASE}/members/${id}`);
  if (!response.ok) throw new Error("Failed to fetch member");
  return response.json();
}

export async function createMember(member: InsertMember): Promise<Member> {
  const response = await fetch(`${API_BASE}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!response.ok) throw new Error("Failed to create member");
  return response.json();
}

export async function updateMember(id: string, data: Partial<InsertMember>): Promise<Member> {
  const response = await fetch(`${API_BASE}/members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update member");
  return response.json();
}

export async function fetchMemberLedger(id: string): Promise<MemberLedger> {
  const response = await fetch(`${API_BASE}/members/${id}/ledger`);
  if (!response.ok) throw new Error("Failed to fetch member ledger");
  return response.json();
}

export async function fetchSessions(): Promise<SessionWithDetails[]> {
  const response = await fetch(`${API_BASE}/sessions`);
  if (!response.ok) throw new Error("Failed to fetch sessions");
  return response.json();
}

export async function createSession(session: InsertSession): Promise<SessionWithDetails> {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  if (!response.ok) throw new Error("Failed to create session");
  return response.json();
}

export async function fetchDebts(memberId?: string): Promise<DebtWithMembers[]> {
  const url = memberId 
    ? `${API_BASE}/debts?memberId=${memberId}`
    : `${API_BASE}/debts`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch debts");
  return response.json();
}

export async function settleDebt(debtId: string): Promise<Debt> {
  const response = await fetch(`${API_BASE}/debts/${debtId}/settle`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to settle debt");
  return response.json();
}

export async function fetchMemberFinancialSummary(memberId: string): Promise<MemberFinancialSummary> {
  const response = await fetch(`${API_BASE}/members/${memberId}/summary`);
  if (!response.ok) throw new Error("Failed to fetch financial summary");
  return response.json();
}
