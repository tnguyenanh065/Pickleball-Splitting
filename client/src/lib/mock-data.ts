
import { addDays, subDays, format } from "date-fns";

export type User = {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
};

export type Session = {
  id: string;
  date: string;
  location: string;
  totalCost: number;
  payerId: string;
  participants: string[]; // User IDs
  status: "settled" | "pending";
};

export type Debt = {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: string;
  status: "pending" | "paid";
};

export const USERS: User[] = [
  { id: "u1", name: "You", initials: "ME" },
  { id: "u2", name: "Sarah Chen", initials: "SC" },
  { id: "u3", name: "Mike Ross", initials: "MR" },
  { id: "u4", name: "Jessica Pearson", initials: "JP" },
  { id: "u5", name: "Harvey Specter", initials: "HS" },
];

export const SESSIONS: Session[] = [
  {
    id: "s1",
    date: subDays(new Date(), 2).toISOString(),
    location: "Riverside Courts",
    totalCost: 400000, // VND approx
    payerId: "u1",
    participants: ["u1", "u2", "u3", "u4"],
    status: "pending",
  },
  {
    id: "s2",
    date: subDays(new Date(), 5).toISOString(),
    location: "Downtown Club",
    totalCost: 350000,
    payerId: "u2",
    participants: ["u1", "u2", "u5"],
    status: "pending",
  },
  {
    id: "s3",
    date: subDays(new Date(), 9).toISOString(),
    location: "Riverside Courts",
    totalCost: 420000,
    payerId: "u3",
    participants: ["u1", "u2", "u3", "u4"],
    status: "settled",
  },
];

// Calculated Debt Relationships (Mocked for UI)
export const DEBTS = [
  { id: "d1", fromUserId: "u2", toUserId: "u1", amount: 100000, date: subDays(new Date(), 2).toISOString(), status: "pending" },
  { id: "d2", fromUserId: "u3", toUserId: "u1", amount: 100000, date: subDays(new Date(), 2).toISOString(), status: "pending" },
  { id: "d3", fromUserId: "u4", toUserId: "u1", amount: 100000, date: subDays(new Date(), 2).toISOString(), status: "pending" },
  { id: "d4", fromUserId: "u1", toUserId: "u2", amount: 116666, date: subDays(new Date(), 5).toISOString(), status: "pending" },
];

export const TREND_DATA = [
  { date: "Apr 01", balance: 0 },
  { date: "Apr 05", balance: -50000 },
  { date: "Apr 10", balance: 150000 },
  { date: "Apr 15", balance: 100000 },
  { date: "Apr 20", balance: 250000 },
  { date: "Today", balance: 183334 },
];
