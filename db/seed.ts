import { db } from "./index";
import { members, sessions, sessionParticipants, debts } from "@shared/schema";
import { subDays } from "date-fns";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(debts);
  await db.delete(sessionParticipants);
  await db.delete(sessions);
  await db.delete(members);

  // Create members
  const [me, sarah, mike, jessica, harvey] = await db.insert(members).values([
    { name: "You", initials: "ME" },
    { name: "Sarah Chen", initials: "SC" },
    { name: "Mike Ross", initials: "MR" },
    { name: "Jessica Pearson", initials: "JP" },
    { name: "Harvey Specter", initials: "HS" },
  ]).returning();

  console.log("Created members:", [me, sarah, mike, jessica, harvey].map(m => m.name));

  // Create session 1 (2 days ago)
  const [session1] = await db.insert(sessions).values({
    date: subDays(new Date(), 2),
    location: "Riverside Courts",
    totalCost: "400000",
    payerId: me.id,
    status: "pending",
  }).returning();

  const session1Participants = [me.id, sarah.id, mike.id, jessica.id];
  const shareAmount1 = "100000"; // 400000 / 4

  await db.insert(sessionParticipants).values(
    session1Participants.map(memberId => ({
      sessionId: session1.id,
      memberId,
      shareAmount: shareAmount1,
    }))
  );

  await db.insert(debts).values([
    { sessionId: session1.id, fromMemberId: sarah.id, toMemberId: me.id, amount: shareAmount1, status: "pending" },
    { sessionId: session1.id, fromMemberId: mike.id, toMemberId: me.id, amount: shareAmount1, status: "pending" },
    { sessionId: session1.id, fromMemberId: jessica.id, toMemberId: me.id, amount: shareAmount1, status: "pending" },
  ]);

  console.log("Created session 1");

  // Create session 2 (5 days ago)
  const [session2] = await db.insert(sessions).values({
    date: subDays(new Date(), 5),
    location: "Downtown Club",
    totalCost: "350000",
    payerId: sarah.id,
    status: "pending",
  }).returning();

  const session2Participants = [me.id, sarah.id, harvey.id];
  const shareAmount2 = "116666.67"; // 350000 / 3

  await db.insert(sessionParticipants).values(
    session2Participants.map(memberId => ({
      sessionId: session2.id,
      memberId,
      shareAmount: shareAmount2,
    }))
  );

  await db.insert(debts).values([
    { sessionId: session2.id, fromMemberId: me.id, toMemberId: sarah.id, amount: shareAmount2, status: "pending" },
    { sessionId: session2.id, fromMemberId: harvey.id, toMemberId: sarah.id, amount: shareAmount2, status: "pending" },
  ]);

  console.log("Created session 2");

  // Create session 3 (9 days ago) - settled
  const [session3] = await db.insert(sessions).values({
    date: subDays(new Date(), 9),
    location: "Riverside Courts",
    totalCost: "420000",
    payerId: mike.id,
    status: "settled",
  }).returning();

  const session3Participants = [me.id, sarah.id, mike.id, jessica.id];
  const shareAmount3 = "105000"; // 420000 / 4

  await db.insert(sessionParticipants).values(
    session3Participants.map(memberId => ({
      sessionId: session3.id,
      memberId,
      shareAmount: shareAmount3,
    }))
  );

  await db.insert(debts).values([
    { sessionId: session3.id, fromMemberId: me.id, toMemberId: mike.id, amount: shareAmount3, status: "paid" },
    { sessionId: session3.id, fromMemberId: sarah.id, toMemberId: mike.id, amount: shareAmount3, status: "paid" },
    { sessionId: session3.id, fromMemberId: jessica.id, toMemberId: mike.id, amount: shareAmount3, status: "paid" },
  ]);

  console.log("Created session 3");
  console.log("Seeding complete!");
}

seed().catch(console.error);
