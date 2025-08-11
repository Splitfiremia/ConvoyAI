var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express4 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  calls;
  appointments;
  analytics;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.calls = /* @__PURE__ */ new Map();
    this.appointments = /* @__PURE__ */ new Map();
    this.analytics = /* @__PURE__ */ new Map();
    this.initializeDefaultData();
  }
  initializeDefaultData() {
    const adminUser = {
      id: randomUUID(),
      username: "admin",
      password: "admin123",
      name: "John Smith",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      status: "available",
      brandId: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    const teamMembers = [
      {
        id: randomUUID(),
        username: "tom.wilson",
        password: "password123",
        name: "Tom Wilson",
        role: "senior_agent",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        status: "available",
        brandId: null,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        username: "sarah.martinez",
        password: "password123",
        name: "Sarah Martinez",
        role: "support_agent",
        avatar: "https://pixabay.com/get/g3b7853b341312558784f58e86fa7d319f656093dc9f5c6c19a895b2e2991543a6383553c379863e70b985ffb1ed6fab8f334124718d63c610e31bf5eacaf5e07_1280.jpg",
        status: "on_call",
        brandId: null,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        username: "alex.thompson",
        password: "password123",
        name: "Alex Thompson",
        role: "lead_agent",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        status: "break",
        brandId: null,
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    this.users.set(adminUser.id, adminUser);
    teamMembers.forEach((user) => this.users.set(user.id, user));
    const todayAnalytics = {
      id: randomUUID(),
      date: /* @__PURE__ */ new Date(),
      totalCalls: 847,
      answeredCalls: 823,
      avgResponseTime: 2,
      customerSatisfaction: 96,
      aiHandledCalls: 678,
      transferredCalls: 145
    };
    this.analytics.set(this.getDateKey(/* @__PURE__ */ new Date()), todayAnalytics);
  }
  getDateKey(date) {
    return date.toISOString().split("T")[0];
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      status: insertUser.status || "available",
      role: insertUser.role || "agent",
      avatar: insertUser.avatar || null,
      brandId: insertUser.brandId || null
    };
    this.users.set(id, user);
    return user;
  }
  async updateUserStatus(id, status) {
    const user = this.users.get(id);
    if (!user) return false;
    user.status = status;
    this.users.set(id, user);
    return true;
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  // Call operations
  async createCall(insertCall) {
    const id = randomUUID();
    const call = {
      ...insertCall,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      status: insertCall.status || "queued",
      isAiHandled: insertCall.isAiHandled !== void 0 ? insertCall.isAiHandled : true,
      duration: insertCall.duration || null,
      assignedAgentId: insertCall.assignedAgentId || null,
      startTime: insertCall.startTime || null,
      endTime: insertCall.endTime || null,
      transcription: insertCall.transcription || null,
      sentiment: insertCall.sentiment || null
    };
    this.calls.set(id, call);
    return call;
  }
  async getCall(id) {
    return this.calls.get(id);
  }
  async updateCall(id, updates) {
    const call = this.calls.get(id);
    if (!call) return false;
    Object.assign(call, updates);
    this.calls.set(id, call);
    return true;
  }
  async getActiveCalls() {
    return Array.from(this.calls.values()).filter((call) => call.status === "active");
  }
  async getCallsByStatus(status) {
    return Array.from(this.calls.values()).filter((call) => call.status === status);
  }
  async getAllCalls() {
    return Array.from(this.calls.values());
  }
  // Appointment operations
  async createAppointment(insertAppointment) {
    const id = randomUUID();
    const appointment = {
      ...insertAppointment,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      status: insertAppointment.status || "scheduled",
      email: insertAppointment.email || null,
      phoneNumber: insertAppointment.phoneNumber || null,
      notes: insertAppointment.notes || null,
      createdByCallId: insertAppointment.createdByCallId || null
    };
    this.appointments.set(id, appointment);
    return appointment;
  }
  async getAppointment(id) {
    return this.appointments.get(id);
  }
  async updateAppointment(id, updates) {
    const appointment = this.appointments.get(id);
    if (!appointment) return false;
    Object.assign(appointment, updates);
    this.appointments.set(id, appointment);
    return true;
  }
  async getUpcomingAppointments() {
    const now = /* @__PURE__ */ new Date();
    return Array.from(this.appointments.values()).filter((appt) => new Date(appt.date) > now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  async getAppointmentsByDate(date) {
    const dateKey = this.getDateKey(date);
    return Array.from(this.appointments.values()).filter((appt) => this.getDateKey(new Date(appt.date)) === dateKey);
  }
  // Analytics operations
  async createAnalyticsEntry(insertAnalytics) {
    const id = randomUUID();
    const analytics2 = {
      ...insertAnalytics,
      id,
      date: insertAnalytics.date || /* @__PURE__ */ new Date(),
      totalCalls: insertAnalytics.totalCalls || 0,
      answeredCalls: insertAnalytics.answeredCalls || 0,
      avgResponseTime: insertAnalytics.avgResponseTime || 0,
      customerSatisfaction: insertAnalytics.customerSatisfaction || 0,
      aiHandledCalls: insertAnalytics.aiHandledCalls || 0,
      transferredCalls: insertAnalytics.transferredCalls || 0
    };
    const dateKey = this.getDateKey(analytics2.date);
    this.analytics.set(dateKey, analytics2);
    return analytics2;
  }
  async getAnalyticsByDate(date) {
    const dateKey = this.getDateKey(date);
    return this.analytics.get(dateKey);
  }
  async getTodayAnalytics() {
    return this.getAnalyticsByDate(/* @__PURE__ */ new Date());
  }
};
var storage = new MemStorage();

// server/services/telephony.ts
var MockTelephonyService = class {
  incomingCallQueue = [];
  activeCallsMap = /* @__PURE__ */ new Map();
  callListeners = [];
  constructor() {
    this.simulateIncomingCalls();
  }
  simulateIncomingCalls() {
    const mockCallers = [
      { name: "Sarah Johnson", number: "+1 (555) 123-4567", purpose: "Booking appointment" },
      { name: "Mike Chen", number: "+1 (555) 987-6543", purpose: "Technical support" },
      { name: "Emma Davis", number: "+1 (555) 456-7890", purpose: "General inquiry" },
      { name: "Robert Smith", number: "+1 (555) 111-2222", purpose: "Follow-up call" },
      { name: "Lisa Anderson", number: "+1 (555) 333-4444", purpose: "Billing question" },
      { name: "David Wilson", number: "+1 (555) 555-6666", purpose: "Service request" }
    ];
    const scheduleNextCall = () => {
      const delay = Math.random() * 9e4 + 3e4;
      setTimeout(() => {
        const caller = mockCallers[Math.floor(Math.random() * mockCallers.length)];
        const incomingCall = {
          id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerName: caller.name,
          phoneNumber: caller.number,
          purpose: caller.purpose,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.incomingCallQueue.push(incomingCall);
        this.notifyCallListeners(incomingCall);
        scheduleNextCall();
      }, delay);
    };
    scheduleNextCall();
  }
  notifyCallListeners(call) {
    this.callListeners.forEach((listener) => listener(call));
  }
  onIncomingCall(listener) {
    this.callListeners.push(listener);
  }
  removeCallListener(listener) {
    const index = this.callListeners.indexOf(listener);
    if (index > -1) {
      this.callListeners.splice(index, 1);
    }
  }
  answerCall(callId, agentId) {
    const callIndex = this.incomingCallQueue.findIndex((call2) => call2.id === callId);
    if (callIndex === -1) return false;
    const call = this.incomingCallQueue.splice(callIndex, 1)[0];
    this.activeCallsMap.set(callId, {
      ...call,
      startTime: /* @__PURE__ */ new Date(),
      agentId: agentId || "ai",
      status: "active"
    });
    return true;
  }
  endCall(callId) {
    if (!this.activeCallsMap.has(callId)) return false;
    const call = this.activeCallsMap.get(callId);
    call.endTime = /* @__PURE__ */ new Date();
    call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1e3);
    call.status = "completed";
    this.activeCallsMap.delete(callId);
    return true;
  }
  transferCall(callId, toAgentId) {
    const call = this.activeCallsMap.get(callId);
    if (!call) return false;
    call.agentId = toAgentId;
    call.transferTime = /* @__PURE__ */ new Date();
    return true;
  }
  getQueuedCalls() {
    return [...this.incomingCallQueue];
  }
  getActiveCalls() {
    return Array.from(this.activeCallsMap.values());
  }
  makeOutboundCall(phoneNumber, agentId) {
    const callId = `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeCallsMap.set(callId, {
      id: callId,
      phoneNumber,
      agentId,
      startTime: /* @__PURE__ */ new Date(),
      status: "active",
      type: "outbound"
    });
    return callId;
  }
};
var telephonyService = new MockTelephonyService();

// server/services/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});
async function handleAIConversation(userMessage, context) {
  try {
    const systemPrompt = `You are an intelligent AI receptionist for a business. Your role is to:
1. Greet callers professionally and warmly
2. Understand their needs and route appropriately
3. Schedule appointments when requested
4. Answer common business questions
5. Transfer to human agents when needed
6. Maintain a helpful, professional tone

Context: Customer ${context.customerName || "unknown"} calling from ${context.phoneNumber}
Previous conversation: ${context.conversationHistory.slice(-5).join(" ")}

Respond with JSON containing:
- response: Your verbal response to the customer
- intent: The customer's intent (greeting, appointment, question, complaint, transfer_request)
- shouldTransfer: Boolean if human agent is needed
- appointmentRequested: Boolean if they want to schedule
- sentiment: {rating: 1-5, confidence: 0-1}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      response: result.response || "I'm here to help. How can I assist you today?",
      intent: result.intent || "greeting",
      shouldTransfer: result.shouldTransfer || false,
      appointmentRequested: result.appointmentRequested || false,
      sentiment: {
        rating: Math.max(1, Math.min(5, result.sentiment?.rating || 3)),
        confidence: Math.max(0, Math.min(1, result.sentiment?.confidence || 0.5))
      }
    };
  } catch (error) {
    console.error("OpenAI conversation error:", error);
    return {
      response: "I apologize, but I'm having technical difficulties. Let me transfer you to a human agent.",
      intent: "error",
      shouldTransfer: true,
      sentiment: { rating: 2, confidence: 0.8 }
    };
  }
}

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analytics: () => analytics,
  appointments: () => appointments,
  brandSettings: () => brandSettings,
  brandSettingsRelations: () => brandSettingsRelations,
  brands: () => brands,
  brandsRelations: () => brandsRelations,
  calls: () => calls,
  insertAnalyticsSchema: () => insertAnalyticsSchema,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertBrandSchema: () => insertBrandSchema,
  insertBrandSettingsSchema: () => insertBrandSettingsSchema,
  insertCallSchema: () => insertCallSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertUserSchema: () => insertUserSchema,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("agent"),
  avatar: text("avatar"),
  status: text("status").notNull().default("available"),
  // available, busy, on_call, break, offline
  brandId: varchar("brand_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var calls = pgTable("calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("queued"),
  // queued, active, completed, transferred
  assignedAgentId: varchar("assigned_agent_id").references(() => users.id),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  // in seconds
  transcription: text("transcription"),
  sentiment: json("sentiment").$type(),
  isAiHandled: boolean("is_ai_handled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  service: text("service").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("scheduled"),
  // scheduled, confirmed, pending, cancelled, completed
  notes: text("notes"),
  createdByCallId: varchar("created_by_call_id").references(() => calls.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().default(sql`now()`),
  totalCalls: integer("total_calls").notNull().default(0),
  answeredCalls: integer("answered_calls").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0),
  // in seconds
  customerSatisfaction: integer("customer_satisfaction").notNull().default(0),
  // percentage
  aiHandledCalls: integer("ai_handled_calls").notNull().default(0),
  transferredCalls: integer("transferred_calls").notNull().default(0)
});
var brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subdomain: text("subdomain").unique().notNull(),
  customDomain: text("custom_domain"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#3B82F6"),
  secondaryColor: text("secondary_color").default("#1E40AF"),
  accentColor: text("accent_color").default("#F59E0B"),
  companyName: text("company_name").notNull(),
  supportEmail: text("support_email").notNull(),
  whiteLabelEnabled: boolean("white_label_enabled").default(false),
  whiteLabelPrice: decimal("white_label_price", { precision: 10, scale: 2 }).default("199.00"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var brandSettings = pgTable("brand_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").notNull(),
  serviceType: text("service_type").notNull(),
  // 'voice', 'email', 'mobile'
  settings: json("settings").$type(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  brandId: varchar("brand_id"),
  plan: text("plan").notNull(),
  // 'starter', 'professional', 'enterprise'
  whiteLabelAddon: boolean("white_label_addon").default(false),
  status: text("status").notNull().default("active"),
  // 'active', 'cancelled', 'expired'
  trialEnd: timestamp("trial_end"),
  currentPeriodStart: timestamp("current_period_start").notNull().default(sql`now()`),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  createdAt: true
});
var insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true
});
var insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true
});
var brandsRelations = relations(brands, ({ many }) => ({
  settings: many(brandSettings),
  users: many(users),
  subscriptions: many(subscriptions)
}));
var brandSettingsRelations = relations(brandSettings, ({ one }) => ({
  brand: one(brands, {
    fields: [brandSettings.brandId],
    references: [brands.id]
  })
}));
var usersRelations = relations(users, ({ one }) => ({
  brand: one(brands, {
    fields: [users.brandId],
    references: [brands.id]
  })
}));
var subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  }),
  brand: one(brands, {
    fields: [subscriptions.brandId],
    references: [brands.id]
  })
}));
var insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBrandSettingsSchema = createInsertSchema(brandSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import { z as z3 } from "zod";

// server/services/email/index.ts
import express from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { MailService } from "@sendgrid/mail";
import OpenAI2 from "openai";
var emailResponseSchema = z.object({
  id: z.string(),
  fromEmail: z.string().email(),
  toEmail: z.string().email(),
  subject: z.string(),
  originalContent: z.string(),
  aiResponse: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  category: z.enum(["inquiry", "complaint", "support", "sales", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "processing", "sent", "failed"]),
  gmailThreadId: z.string().optional(),
  processedAt: z.date(),
  sentAt: z.date().optional()
});
var emailProcessRequestSchema = z.object({
  fromEmail: z.string().email(),
  toEmail: z.string().email(),
  subject: z.string(),
  content: z.string(),
  gmailThreadId: z.string().optional()
});
var EmailStorage = class {
  emailResponses = /* @__PURE__ */ new Map();
  async create(data) {
    const emailResponse = {
      ...data,
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processedAt: /* @__PURE__ */ new Date()
    };
    this.emailResponses.set(emailResponse.id, emailResponse);
    return emailResponse;
  }
  async findById(id) {
    return this.emailResponses.get(id) || null;
  }
  async findAll() {
    return Array.from(this.emailResponses.values());
  }
  async findByEmail(email) {
    return Array.from(this.emailResponses.values()).filter((response) => response.fromEmail === email || response.toEmail === email);
  }
  async updateStatus(id, status, sentAt) {
    const emailResponse = this.emailResponses.get(id);
    if (!emailResponse) return null;
    const updated = {
      ...emailResponse,
      status,
      ...sentAt && { sentAt }
    };
    this.emailResponses.set(id, updated);
    return updated;
  }
};
var EmailAIProcessor = class {
  openai;
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for Email AI Service");
    }
    this.openai = new OpenAI2({ apiKey: process.env.OPENAI_API_KEY });
  }
  async processEmail(content, subject) {
    try {
      const prompt = `
You are an AI email assistant for Convoy AI. Analyze and respond to this email:

Subject: ${subject}
Content: ${content}

Please provide:
1. A professional, helpful response
2. Sentiment analysis (positive/neutral/negative)
3. Category (inquiry/complaint/support/sales/other)
4. Priority level (low/medium/high/urgent)

Respond in JSON format:
{
  "response": "Professional email response here",
  "sentiment": "positive|neutral|negative",
  "category": "inquiry|complaint|support|sales|other",
  "priority": "low|medium|high|urgent"
}
      `;
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const result = JSON.parse(completion.choices[0].message.content || "{}");
      return {
        response: result.response || "Thank you for your email. We have received your message and will respond shortly.",
        sentiment: result.sentiment || "neutral",
        category: result.category || "other",
        priority: result.priority || "medium"
      };
    } catch (error) {
      console.error("Email AI processing error:", error);
      return {
        response: "Thank you for your email. We have received your message and will respond shortly.",
        sentiment: "neutral",
        category: "other",
        priority: "medium"
      };
    }
  }
};
var EmailSender = class {
  mailService = null;
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not configured - Email sending will be simulated");
      return;
    }
    this.mailService = new MailService();
    this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
  }
  async sendEmail(to, from, subject, content) {
    try {
      if (!this.mailService) {
        console.log(`[EMAIL SIMULATION] To: ${to}, Subject: Re: ${subject}, Content: ${content}`);
        return true;
      }
      await this.mailService.send({
        to,
        from,
        subject: `Re: ${subject}`,
        html: content,
        text: content.replace(/<[^>]*>/g, "")
        // Strip HTML for text version
      });
      return true;
    } catch (error) {
      console.error("SendGrid email sending error:", error);
      return false;
    }
  }
};
function createEmailServiceRouter() {
  const router2 = express.Router();
  const storage2 = new EmailStorage();
  const aiProcessor = new EmailAIProcessor();
  const emailSender = new EmailSender();
  router2.post("/process", async (req, res) => {
    try {
      const validatedData = emailProcessRequestSchema.parse(req.body);
      const aiResult = await aiProcessor.processEmail(
        validatedData.content,
        validatedData.subject
      );
      const emailResponse = await storage2.create({
        fromEmail: validatedData.fromEmail,
        toEmail: validatedData.toEmail,
        subject: validatedData.subject,
        originalContent: validatedData.content,
        aiResponse: aiResult.response,
        sentiment: aiResult.sentiment,
        category: aiResult.category,
        priority: aiResult.priority,
        status: "processing",
        gmailThreadId: validatedData.gmailThreadId
      });
      const emailSent = await emailSender.sendEmail(
        validatedData.fromEmail,
        validatedData.toEmail,
        validatedData.subject,
        aiResult.response
      );
      await storage2.updateStatus(
        emailResponse.id,
        emailSent ? "sent" : "failed",
        emailSent ? /* @__PURE__ */ new Date() : void 0
      );
      res.status(201).json({
        success: true,
        data: {
          id: emailResponse.id,
          status: emailSent ? "sent" : "failed",
          aiResponse: aiResult.response,
          analysis: {
            sentiment: aiResult.sentiment,
            category: aiResult.category,
            priority: aiResult.priority
          }
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: fromZodError(error).toString()
        });
      }
      console.error("Email processing error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.get("/responses/:id", async (req, res) => {
    try {
      const emailResponse = await storage2.findById(req.params.id);
      if (!emailResponse) {
        return res.status(404).json({
          success: false,
          error: "Email response not found"
        });
      }
      res.json({
        success: true,
        data: emailResponse
      });
    } catch (error) {
      console.error("Error fetching email response:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.get("/responses", async (req, res) => {
    try {
      const responses = await storage2.findAll();
      res.json({
        success: true,
        data: responses,
        total: responses.length
      });
    } catch (error) {
      console.error("Error fetching email responses:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.get("/responses/email/:email", async (req, res) => {
    try {
      const responses = await storage2.findByEmail(req.params.email);
      res.json({
        success: true,
        data: responses,
        total: responses.length
      });
    } catch (error) {
      console.error("Error fetching email responses:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.get("/health", (req, res) => {
    res.json({
      service: "Email AI Service",
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      apis: {
        openai: !!process.env.OPENAI_API_KEY,
        sendgrid: !!process.env.SENDGRID_API_KEY
      }
    });
  });
  return router2;
}

// server/services/mobile/index.ts
import express2 from "express";
import { z as z2 } from "zod";
import { fromZodError as fromZodError2 } from "zod-validation-error";
import OpenAI3 from "openai";
var mobileCommunicationSchema = z2.object({
  id: z2.string(),
  phoneNumber: z2.string(),
  deviceToken: z2.string().optional(),
  messageType: z2.enum(["sms", "push_notification", "whatsapp"]),
  direction: z2.enum(["inbound", "outbound"]),
  originalMessage: z2.string(),
  aiResponse: z2.string().optional(),
  intent: z2.enum(["appointment", "inquiry", "support", "emergency", "marketing", "other"]),
  sentiment: z2.enum(["positive", "neutral", "negative"]),
  priority: z2.enum(["low", "medium", "high", "urgent"]),
  status: z2.enum(["received", "processing", "sent", "delivered", "failed"]),
  twilioSid: z2.string().optional(),
  fcmMessageId: z2.string().optional(),
  processedAt: z2.date(),
  sentAt: z2.date().optional(),
  deliveredAt: z2.date().optional()
});
var mobileMessageRequestSchema = z2.object({
  phoneNumber: z2.string(),
  message: z2.string(),
  messageType: z2.enum(["sms", "push_notification", "whatsapp"]),
  deviceToken: z2.string().optional(),
  twilioSid: z2.string().optional()
});
var pushNotificationRequestSchema = z2.object({
  deviceToken: z2.string(),
  title: z2.string(),
  body: z2.string(),
  data: z2.record(z2.string()).optional()
});
var MobileStorage = class {
  mobileCommunications = /* @__PURE__ */ new Map();
  async create(data) {
    const mobileCommunication = {
      ...data,
      id: `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processedAt: /* @__PURE__ */ new Date()
    };
    this.mobileCommunications.set(mobileCommunication.id, mobileCommunication);
    return mobileCommunication;
  }
  async findById(id) {
    return this.mobileCommunications.get(id) || null;
  }
  async findAll() {
    return Array.from(this.mobileCommunications.values());
  }
  async findByPhoneNumber(phoneNumber) {
    return Array.from(this.mobileCommunications.values()).filter((comm) => comm.phoneNumber === phoneNumber);
  }
  async updateStatus(id, status, sentAt, deliveredAt) {
    const communication = this.mobileCommunications.get(id);
    if (!communication) return null;
    const updated = {
      ...communication,
      status,
      ...sentAt && { sentAt },
      ...deliveredAt && { deliveredAt }
    };
    this.mobileCommunications.set(id, updated);
    return updated;
  }
};
var MobileAIProcessor = class {
  openai;
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for Mobile AI Service");
    }
    this.openai = new OpenAI3({ apiKey: process.env.OPENAI_API_KEY });
  }
  async processMobileMessage(message, messageType) {
    try {
      const prompt = `
You are an AI assistant for Convoy AI's mobile communication service. Analyze and respond to this ${messageType} message:

Message: ${message}

Please provide:
1. A concise, helpful response (appropriate for ${messageType})
2. Intent analysis (appointment/inquiry/support/emergency/marketing/other)
3. Sentiment analysis (positive/neutral/negative)
4. Priority level (low/medium/high/urgent)

For SMS responses, keep under 160 characters when possible.
For push notifications, keep title under 50 characters and body under 150 characters.

Respond in JSON format:
{
  "response": "Appropriate response here",
  "intent": "appointment|inquiry|support|emergency|marketing|other",
  "sentiment": "positive|neutral|negative",
  "priority": "low|medium|high|urgent"
}
      `;
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const result = JSON.parse(completion.choices[0].message.content || "{}");
      return {
        response: result.response || "Thank you for your message. We will get back to you soon.",
        intent: result.intent || "other",
        sentiment: result.sentiment || "neutral",
        priority: result.priority || "medium"
      };
    } catch (error) {
      console.error("Mobile AI processing error:", error);
      return {
        response: "Thank you for your message. We will get back to you soon.",
        intent: "other",
        sentiment: "neutral",
        priority: "medium"
      };
    }
  }
};
var TwilioSMSService = class {
  accountSid;
  authToken;
  fromNumber;
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || "";
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || "";
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      console.warn("Twilio credentials not fully configured - SMS functionality will be simulated");
    }
  }
  async sendSMS(to, message) {
    try {
      const mockSid = `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      console.log(`[TWILIO SMS] To: ${to}, Message: ${message}`);
      return { success: true, sid: mockSid };
    } catch (error) {
      console.error("SMS sending error:", error);
      return { success: false };
    }
  }
};
var FCMService = class {
  serverKey;
  constructor() {
    this.serverKey = process.env.FIREBASE_SERVER_KEY || "";
    if (!this.serverKey) {
      console.warn("Firebase Server Key not configured - Push notifications will be simulated");
    }
  }
  async sendPushNotification(deviceToken, title, body, data) {
    try {
      const mockMessageId = `fcm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`[FCM PUSH] Token: ${deviceToken}, Title: ${title}, Body: ${body}`);
      return { success: true, messageId: mockMessageId };
    } catch (error) {
      console.error("Push notification sending error:", error);
      return { success: false };
    }
  }
};
function createMobileServiceRouter() {
  const router2 = express2.Router();
  const storage2 = new MobileStorage();
  const aiProcessor = new MobileAIProcessor();
  const smsService = new TwilioSMSService();
  const fcmService = new FCMService();
  router2.post("/process", async (req, res) => {
    try {
      const validatedData = mobileMessageRequestSchema.parse(req.body);
      const aiResult = await aiProcessor.processMobileMessage(
        validatedData.message,
        validatedData.messageType
      );
      const mobileCommunication = await storage2.create({
        phoneNumber: validatedData.phoneNumber,
        deviceToken: validatedData.deviceToken,
        messageType: validatedData.messageType,
        direction: "inbound",
        originalMessage: validatedData.message,
        aiResponse: aiResult.response,
        intent: aiResult.intent,
        sentiment: aiResult.sentiment,
        priority: aiResult.priority,
        status: "processing",
        twilioSid: validatedData.twilioSid
      });
      let sendResult = { success: false, externalId: "" };
      if (validatedData.messageType === "sms") {
        const smsResult = await smsService.sendSMS(validatedData.phoneNumber, aiResult.response);
        sendResult = { success: smsResult.success, externalId: smsResult.sid || "" };
      } else if (validatedData.messageType === "push_notification" && validatedData.deviceToken) {
        const pushResult = await fcmService.sendPushNotification(
          validatedData.deviceToken,
          "Convoy AI Response",
          aiResult.response
        );
        sendResult = { success: pushResult.success, externalId: pushResult.messageId || "" };
      }
      await storage2.updateStatus(
        mobileCommunication.id,
        sendResult.success ? "sent" : "failed",
        sendResult.success ? /* @__PURE__ */ new Date() : void 0
      );
      res.status(201).json({
        success: true,
        data: {
          id: mobileCommunication.id,
          status: sendResult.success ? "sent" : "failed",
          aiResponse: aiResult.response,
          analysis: {
            intent: aiResult.intent,
            sentiment: aiResult.sentiment,
            priority: aiResult.priority
          },
          externalId: sendResult.externalId
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: fromZodError2(error).toString()
        });
      }
      console.error("Mobile processing error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.post("/push", async (req, res) => {
    try {
      const validatedData = pushNotificationRequestSchema.parse(req.body);
      const result = await fcmService.sendPushNotification(
        validatedData.deviceToken,
        validatedData.title,
        validatedData.body,
        validatedData.data
      );
      if (result.success) {
        await storage2.create({
          phoneNumber: "N/A",
          deviceToken: validatedData.deviceToken,
          messageType: "push_notification",
          direction: "outbound",
          originalMessage: `${validatedData.title}: ${validatedData.body}`,
          intent: "other",
          sentiment: "neutral",
          priority: "medium",
          status: "sent",
          fcmMessageId: result.messageId,
          sentAt: /* @__PURE__ */ new Date()
        });
      }
      res.json({
        success: result.success,
        messageId: result.messageId
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: fromZodError2(error).toString()
        });
      }
      console.error("Push notification error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.get("/communications/:id", async (req, res) => {
    try {
      const communication = await storage2.findById(req.params.id);
      if (!communication) {
        return res.status(404).json({
          success: false,
          error: "Mobile communication not found"
        });
      }
      res.json({
        success: true,
        data: communication
      });
    } catch (error) {
      console.error("Error fetching mobile communication:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.get("/communications", async (req, res) => {
    try {
      const communications = await storage2.findAll();
      res.json({
        success: true,
        data: communications,
        total: communications.length
      });
    } catch (error) {
      console.error("Error fetching mobile communications:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.get("/communications/phone/:phoneNumber", async (req, res) => {
    try {
      const communications = await storage2.findByPhoneNumber(req.params.phoneNumber);
      res.json({
        success: true,
        data: communications,
        total: communications.length
      });
    } catch (error) {
      console.error("Error fetching mobile communications:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  router2.get("/health", (req, res) => {
    res.json({
      service: "Mobile AI Service",
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      apis: {
        openai: !!process.env.OPENAI_API_KEY,
        twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        fcm: !!process.env.FIREBASE_SERVER_KEY
      }
    });
  });
  return router2;
}

// server/routes/brands.ts
import { Router } from "express";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/routes/brands.ts
import { eq, and } from "drizzle-orm";
var router = Router();
router.get("/current", async (req, res) => {
  try {
    const defaultBrandId = "default-brand-id";
    let [brand] = await db.select().from(brands).where(eq(brands.id, defaultBrandId));
    if (!brand) {
      [brand] = await db.insert(brands).values({
        id: defaultBrandId,
        name: "My Company",
        subdomain: "mycompany",
        companyName: "My Company",
        supportEmail: "support@mycompany.com",
        whiteLabelEnabled: false
      }).returning();
    }
    res.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.patch("/current", async (req, res) => {
  try {
    const data = insertBrandSchema.partial().parse(req.body);
    const brandId = "default-brand-id";
    const [updatedBrand] = await db.update(brands).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(brands.id, brandId)).returning();
    res.json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ error: "Failed to update brand" });
  }
});
router.get("/settings", async (req, res) => {
  try {
    const brandId = "default-brand-id";
    const settings = await db.select().from(brandSettings).where(eq(brandSettings.brandId, brandId));
    res.json(settings);
  } catch (error) {
    console.error("Error fetching brand settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/settings", async (req, res) => {
  try {
    const { serviceType, settings } = req.body;
    const brandId = "default-brand-id";
    if (!serviceType || !settings) {
      return res.status(400).json({ error: "serviceType and settings are required" });
    }
    const [existingSetting] = await db.select().from(brandSettings).where(
      and(
        eq(brandSettings.brandId, brandId),
        eq(brandSettings.serviceType, serviceType)
      )
    );
    if (existingSetting) {
      const [updated] = await db.update(brandSettings).set({
        settings: { [serviceType]: settings },
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(brandSettings.id, existingSetting.id)).returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(brandSettings).values({
        brandId,
        serviceType,
        settings: { [serviceType]: settings }
      }).returning();
      res.json(created);
    }
  } catch (error) {
    console.error("Error updating brand settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});
router.post("/white-label/toggle", async (req, res) => {
  try {
    const { enabled } = req.body;
    const brandId = "default-brand-id";
    const userId = "default-user-id";
    await db.update(brands).set({ whiteLabelEnabled: enabled, updatedAt: /* @__PURE__ */ new Date() }).where(eq(brands.id, brandId));
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    if (subscription) {
      await db.update(subscriptions).set({ whiteLabelAddon: enabled }).where(eq(subscriptions.id, subscription.id));
    } else {
      await db.insert(subscriptions).values({
        userId,
        brandId,
        plan: "professional",
        whiteLabelAddon: enabled,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
        // 30 days from now
      });
    }
    res.json({ success: true, whiteLabelEnabled: enabled });
  } catch (error) {
    console.error("Error toggling white label:", error);
    res.status(500).json({ error: "Failed to toggle white label" });
  }
});
var brands_default = router;

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/analytics/today", async (req, res) => {
    try {
      const analytics2 = await storage.getTodayAnalytics();
      if (!analytics2) {
        return res.status(404).json({ message: "No analytics found for today" });
      }
      res.json(analytics2);
    } catch (error) {
      console.error("Error fetching today's analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/users/:id/status", async (req, res) => {
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
  app2.get("/api/calls", async (req, res) => {
    try {
      const { status } = req.query;
      let calls2;
      if (status && typeof status === "string") {
        calls2 = await storage.getCallsByStatus(status);
      } else {
        calls2 = await storage.getAllCalls();
      }
      res.json(calls2);
    } catch (error) {
      console.error("Error fetching calls:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/calls/active", async (req, res) => {
    try {
      const activeCalls = await storage.getActiveCalls();
      const telephonyActiveCalls = telephonyService.getActiveCalls();
      const allActiveCalls = [...activeCalls, ...telephonyActiveCalls];
      res.json(allActiveCalls);
    } catch (error) {
      console.error("Error fetching active calls:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/calls/queue", async (req, res) => {
    try {
      const queuedCalls = telephonyService.getQueuedCalls();
      res.json(queuedCalls);
    } catch (error) {
      console.error("Error fetching call queue:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/calls/:id/answer", async (req, res) => {
    try {
      const { id } = req.params;
      const { agentId } = req.body;
      const success = telephonyService.answerCall(id, agentId);
      if (!success) {
        return res.status(404).json({ message: "Call not found in queue" });
      }
      const queuedCalls = telephonyService.getQueuedCalls();
      const activeCalls = telephonyService.getActiveCalls();
      const call = activeCalls.find((c) => c.id === id);
      if (call) {
        await storage.createCall({
          customerName: call.customerName,
          phoneNumber: call.phoneNumber,
          purpose: call.purpose || "Unknown",
          status: "active",
          assignedAgentId: agentId,
          startTime: call.startTime || /* @__PURE__ */ new Date(),
          isAiHandled: !agentId
        });
      }
      res.json({ message: "Call answered successfully" });
    } catch (error) {
      console.error("Error answering call:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/calls/:id/transfer", async (req, res) => {
    try {
      const { id } = req.params;
      const { agentId } = req.body;
      if (!agentId) {
        return res.status(400).json({ message: "Agent ID is required" });
      }
      const success = telephonyService.transferCall(id, agentId);
      if (!success) {
        return res.status(404).json({ message: "Call not found" });
      }
      await storage.updateCall(id, {
        assignedAgentId: agentId,
        isAiHandled: false
      });
      res.json({ message: "Call transferred successfully" });
    } catch (error) {
      console.error("Error transferring call:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/calls/:id/end", async (req, res) => {
    try {
      const { id } = req.params;
      const success = telephonyService.endCall(id);
      if (!success) {
        return res.status(404).json({ message: "Call not found" });
      }
      await storage.updateCall(id, {
        status: "completed",
        endTime: /* @__PURE__ */ new Date()
      });
      res.json({ message: "Call ended successfully" });
    } catch (error) {
      console.error("Error ending call:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/ai/conversation", async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      const aiResponse = await handleAIConversation(message, context || {});
      res.json(aiResponse);
    } catch (error) {
      console.error("Error in AI conversation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/appointments", async (req, res) => {
    try {
      const appointments2 = await storage.getUpcomingAppointments();
      res.json(appointments2);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/calls/outbound", async (req, res) => {
    try {
      const { phoneNumber, agentId } = req.body;
      if (!phoneNumber || !agentId) {
        return res.status(400).json({ message: "Phone number and agent ID are required" });
      }
      const callId = telephonyService.makeOutboundCall(phoneNumber, agentId);
      await storage.createCall({
        customerName: "Outbound Call",
        phoneNumber,
        purpose: "Outbound",
        status: "active",
        assignedAgentId: agentId,
        startTime: /* @__PURE__ */ new Date(),
        isAiHandled: false
      });
      res.json({ callId, message: "Outbound call initiated" });
    } catch (error) {
      console.error("Error making outbound call:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Set();
  wss.on("connection", (ws2) => {
    console.log("New WebSocket client connected");
    clients.add(ws2);
    ws2.on("close", () => {
      clients.delete(ws2);
      console.log("WebSocket client disconnected");
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws2);
    });
    ws2.send(JSON.stringify({
      type: "connection_established",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }));
  });
  const broadcast = (data) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  telephonyService.onIncomingCall((call) => {
    broadcast({
      type: "incoming_call",
      data: call,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  setInterval(async () => {
    try {
      const analytics2 = await storage.getTodayAnalytics();
      const activeCalls = await storage.getActiveCalls();
      const queuedCalls = telephonyService.getQueuedCalls();
      const users2 = await storage.getAllUsers();
      broadcast({
        type: "metrics_update",
        data: {
          analytics: analytics2,
          activeCalls: activeCalls.length,
          queuedCalls: queuedCalls.length,
          teamMembers: users2.filter((u) => u.role !== "admin")
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error broadcasting metrics update:", error);
    }
  }, 5e3);
  app2.use("/services/email", createEmailServiceRouter());
  app2.use("/services/mobile", createMobileServiceRouter());
  app2.use("/api/brands", brands_default);
  return httpServer;
}

// server/vite.ts
import express3 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express4();
app.use(express4.json());
app.use(express4.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
