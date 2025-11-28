import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertSessionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Members
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const validation = insertMemberSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      
      const member = await storage.createMember(validation.data);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating member:", error);
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.patch("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.updateMember(req.params.id, req.body);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  // Member Ledger
  app.get("/api/members/:id/ledger", async (req, res) => {
    try {
      const ledger = await storage.getMemberLedger(req.params.id);
      if (!ledger) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(ledger);
    } catch (error) {
      console.error("Error fetching member ledger:", error);
      res.status(500).json({ error: "Failed to fetch member ledger" });
    }
  });

  // Financial Summary
  app.get("/api/members/:id/summary", async (req, res) => {
    try {
      const summary = await storage.getMemberFinancialSummary(req.params.id);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ error: "Failed to fetch financial summary" });
    }
  });

  // Sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validation = insertSessionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }
      
      const session = await storage.createSession(validation.data);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Debts
  app.get("/api/debts", async (req, res) => {
    try {
      const memberId = req.query.memberId as string | undefined;
      const debts = await storage.getDebts(memberId);
      res.json(debts);
    } catch (error) {
      console.error("Error fetching debts:", error);
      res.status(500).json({ error: "Failed to fetch debts" });
    }
  });

  app.post("/api/debts/:id/settle", async (req, res) => {
    try {
      const debt = await storage.settleDebt(req.params.id);
      if (!debt) {
        return res.status(404).json({ error: "Debt not found" });
      }
      res.json(debt);
    } catch (error) {
      console.error("Error settling debt:", error);
      res.status(500).json({ error: "Failed to settle debt" });
    }
  });

  return httpServer;
}
