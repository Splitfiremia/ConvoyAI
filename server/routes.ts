import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { telephonyService } from "./services/telephony";
import { handleAIConversation, transcribeCall, analyzeSentiment } from "./services/openai";
import { insertCallSchema, insertAppointmentSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { createEmailServiceRouter } from "./services/email";
import { createMobileServiceRouter } from "./services/mobile";
import brandsRouter from "./routes/brands";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth login (username/password -> JWT)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const body = z.object({ username: z.string(), password: z.string() }).parse(req.body);
      // Lookup user; for demo use storage.getUserByUsername, then compare plain password
      const users = await storage.getAllUsers();
      const user = users.find(u => u.username === body.username);
      if (!user || user.password !== body.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      // Import signJwt dynamically to avoid cyclic issues
      const { signJwt } = await import('./auth');
      const token = signJwt({ sub: user.id, username: user.username, role: user.role || 'agent' }, { expiresInSec: 60 * 60 });
      return res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Health and readiness endpoints
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/readiness', async (_req, res) => {
    // Basic checks: OpenAI key, optional DB
    const openaiReady = Boolean(process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR);
    const dbReady = Boolean(process.env.DATABASE_URL);
    const statusCode = openaiReady ? 200 : 503;
    res.status(statusCode).json({
      ready: openaiReady,
      dependencies: { openai: openaiReady, database: dbReady },
      timestamp: new Date().toISOString(),
    });
  });
  // Analytics endpoints
  app.get("/api/analytics/today", async (req, res) => {
    try {
      const analytics = await storage.getTodayAnalytics();
      if (!analytics) {
        return res.status(404).json({ message: "No analytics found for today" });
      }
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching today's analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User/Team endpoints
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const success = await storage.updateUserStatus(id, status);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Call endpoints
  app.get("/api/calls", async (req, res) => {
    try {
      const { status } = req.query;
      let calls;
      
      if (status && typeof status === 'string') {
        calls = await storage.getCallsByStatus(status);
      } else {
        calls = await storage.getAllCalls();
      }
      
      res.json(calls);
    } catch (error) {
      console.error("Error fetching calls:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/calls/active", async (req, res) => {
    try {
      const activeCalls = await storage.getActiveCalls();
      const telephonyActiveCalls = telephonyService.getActiveCalls();
      
      // Merge database calls with telephony active calls
      const allActiveCalls = [...activeCalls, ...telephonyActiveCalls];
      res.json(allActiveCalls);
    } catch (error) {
      console.error("Error fetching active calls:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/calls/queue", async (req, res) => {
    try {
      const queuedCalls = telephonyService.getQueuedCalls();
      res.json(queuedCalls);
    } catch (error) {
      console.error("Error fetching call queue:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/calls/:id/answer", async (req, res) => {
    try {
      const { id } = req.params;
      const bodySchema = z.object({ agentId: z.string().optional() });
      const { agentId } = bodySchema.parse(req.body);

      const success = telephonyService.answerCall(id, agentId);
      if (!success) {
        return res.status(404).json({ message: "Call not found in queue" });
      }

      // Create call record in database
      const queuedCalls = telephonyService.getQueuedCalls();
      const activeCalls = telephonyService.getActiveCalls();
      const call = activeCalls.find(c => c.id === id);

      if (call) {
        await storage.createCall({
          customerName: call.customerName,
          phoneNumber: call.phoneNumber,
          purpose: call.purpose || "Unknown",
          status: "active",
          assignedAgentId: agentId,
          startTime: call.startTime || new Date(),
          isAiHandled: !agentId,
        });
      }

      res.json({ message: "Call answered successfully" });
    } catch (error) {
      console.error("Error answering call:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/calls/:id/transfer", async (req, res) => {
    try {
      const { id } = req.params;
      const bodySchema = z.object({ agentId: z.string().min(1) });
      const { agentId } = bodySchema.parse(req.body);

      const success = telephonyService.transferCall(id, agentId);
      if (!success) {
        return res.status(404).json({ message: "Call not found" });
      }

      // Update call record in database
      await storage.updateCall(id, {
        assignedAgentId: agentId,
        isAiHandled: false,
      });

      res.json({ message: "Call transferred successfully" });
    } catch (error) {
      console.error("Error transferring call:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/calls/:id/end", async (req, res) => {
    try {
      const { id } = req.params;

      const success = telephonyService.endCall(id);
      if (!success) {
        return res.status(404).json({ message: "Call not found" });
      }

      // Update call record in database
      await storage.updateCall(id, {
        status: "completed",
        endTime: new Date(),
      });

      res.json({ message: "Call ended successfully" });
    } catch (error) {
      console.error("Error ending call:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Conversation endpoint
  app.post("/api/ai/conversation", async (req, res) => {
    try {
      const schemaBody = z.object({
        message: z.string().min(1),
        context: z.object({
          customerName: z.string().optional(),
          phoneNumber: z.string().min(5),
          purpose: z.string().optional(),
          conversationHistory: z.array(z.string()).default([]),
          callId: z.string().optional(),
        }).optional(),
        options: z.object({
          autoCreateAppointment: z.boolean().default(true),
          autoTransfer: z.boolean().default(true),
          defaultService: z.string().default("Consultation"),
          defaultAppointmentOffsetMins: z.number().int().min(5).max(7 * 24 * 60).default(60),
          transferToAgentId: z.string().optional(),
        }).optional(),
      });
      const { message, context, options } = schemaBody.parse(req.body);

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const aiResponse = await handleAIConversation(message, context || { phoneNumber: "" as any, conversationHistory: [] });

      const results: any = { ai: aiResponse };

      // Auto actions based on AI intent
      const opts = {
        autoCreateAppointment: options?.autoCreateAppointment ?? true,
        autoTransfer: options?.autoTransfer ?? true,
        defaultService: options?.defaultService ?? "Consultation",
        defaultAppointmentOffsetMins: options?.defaultAppointmentOffsetMins ?? 60,
        transferToAgentId: options?.transferToAgentId,
      };

      // Create appointment if requested
      if (aiResponse.appointmentRequested && opts.autoCreateAppointment && context?.phoneNumber) {
        const date = new Date(Date.now() + opts.defaultAppointmentOffsetMins * 60 * 1000);
        const appointment = await storage.createAppointment({
          customerName: context.customerName || "Unknown",
          phoneNumber: context.phoneNumber,
          email: null,
          service: context.purpose || opts.defaultService,
          date,
          status: "pending",
          notes: `Auto-created from AI intent: ${aiResponse.intent}`,
          createdByCallId: context.callId || null,
        });
        results.appointment = appointment;
      }

      // Transfer call to agent if needed
      if (aiResponse.shouldTransfer && opts.autoTransfer && context?.callId) {
        const toAgentId = opts.transferToAgentId;
        const success = toAgentId ? telephonyService.transferCall(context.callId, toAgentId) : false;
        if (success) {
          await storage.updateCall(context.callId, { assignedAgentId: toAgentId || null, isAiHandled: false, status: "active" });
        }
        results.transfer = { success, toAgentId: toAgentId || null };
      }

      res.json(results);
    } catch (error) {
      console.error("Error in AI conversation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointment endpoints
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getUpcomingAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Outbound call endpoint
  app.post("/api/calls/outbound", async (req, res) => {
    try {
      const bodySchema = z.object({
        phoneNumber: z.string().min(5),
        agentId: z.string().min(1),
      });
      const { phoneNumber, agentId } = bodySchema.parse(req.body);

      const callId = telephonyService.makeOutboundCall(phoneNumber, agentId);
      
      // Create call record
      await storage.createCall({
        customerName: "Outbound Call",
        phoneNumber,
        purpose: "Outbound",
        status: "active",
        assignedAgentId: agentId,
        startTime: new Date(),
        isAiHandled: false,
      });

      res.json({ callId, message: "Outbound call initiated" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error making outbound call:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients: Set<WebSocket> = new Set();

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send initial data
    ws.send(JSON.stringify({
      type: 'connection_established',
      timestamp: new Date().toISOString(),
    }));
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Listen to telephony events and broadcast updates
  telephonyService.onIncomingCall((call) => {
    broadcast({
      type: 'incoming_call',
      data: call,
      timestamp: new Date().toISOString(),
    });
  });

  // Periodic updates for metrics
  setInterval(async () => {
    try {
      const analytics = await storage.getTodayAnalytics();
      const activeCalls = await storage.getActiveCalls();
      const queuedCalls = telephonyService.getQueuedCalls();
      const users = await storage.getAllUsers();

      broadcast({
        type: 'metrics_update',
        data: {
          analytics,
          activeCalls: activeCalls.length,
          queuedCalls: queuedCalls.length,
          teamMembers: users.filter(u => u.role !== 'admin'),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error broadcasting metrics update:', error);
    }
  }, 5000); // Every 5 seconds

  // Register Independent Services
  // Email AI Service - Completely isolated
  app.use('/services/email', createEmailServiceRouter());
  
  // Mobile AI Service - Completely isolated  
  app.use('/services/mobile', createMobileServiceRouter());
  
  // White Label Management - Brand customization (require DATABASE_URL)
  if (process.env.DATABASE_URL) {
    app.use('/api/brands', brandsRouter);
  }

  return httpServer;
}
