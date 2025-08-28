import { type User, type InsertUser, type Call, type InsertCall, type Appointment, type InsertAppointment, type Analytics, type InsertAnalytics } from "@shared/schema";
import * as schema from "@shared/schema";
import { and, eq, gt, gte, lt } from "drizzle-orm";
type DrizzleDb = typeof import("./db").db;
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: string, status: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Call operations
  createCall(call: InsertCall): Promise<Call>;
  getCall(id: string): Promise<Call | undefined>;
  updateCall(id: string, updates: Partial<Call>): Promise<boolean>;
  getActiveCalls(): Promise<Call[]>;
  getCallsByStatus(status: string): Promise<Call[]>;
  getAllCalls(): Promise<Call[]>;

  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<boolean>;
  getUpcomingAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;

  // Analytics operations
  createAnalyticsEntry(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByDate(date: Date): Promise<Analytics | undefined>;
  getTodayAnalytics(): Promise<Analytics | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private calls: Map<string, Call>;
  private appointments: Map<string, Appointment>;
  private analytics: Map<string, Analytics>;

  constructor() {
    this.users = new Map();
    this.calls = new Map();
    this.appointments = new Map();
    this.analytics = new Map();

    // Initialize with some default users and data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123",
      name: "John Smith",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      status: "available",
      brandId: null,
      createdAt: new Date(),
    };

    // Create team members
    const teamMembers: User[] = [
      {
        id: randomUUID(),
        username: "tom.wilson",
        password: "password123",
        name: "Tom Wilson",
        role: "senior_agent",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        status: "available",
        brandId: null,
        createdAt: new Date(),
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
        createdAt: new Date(),
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
        createdAt: new Date(),
      },
    ];

    this.users.set(adminUser.id, adminUser);
    teamMembers.forEach(user => this.users.set(user.id, user));

    // Create today's analytics
    const todayAnalytics: Analytics = {
      id: randomUUID(),
      date: new Date(),
      totalCalls: 847,
      answeredCalls: 823,
      avgResponseTime: 2,
      customerSatisfaction: 96,
      aiHandledCalls: 678,
      transferredCalls: 145,
    };

    this.analytics.set(this.getDateKey(new Date()), todayAnalytics);
  }

  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      status: insertUser.status || "available",
      role: insertUser.role || "agent",
      avatar: insertUser.avatar || null,
      brandId: insertUser.brandId || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStatus(id: string, status: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    
    user.status = status;
    this.users.set(id, user);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Call operations
  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = randomUUID();
    const call: Call = { 
      ...insertCall, 
      id, 
      createdAt: new Date(),
      status: insertCall.status || "queued",
      isAiHandled: insertCall.isAiHandled !== undefined ? insertCall.isAiHandled : true,
      duration: insertCall.duration || null,
      assignedAgentId: insertCall.assignedAgentId || null,
      startTime: insertCall.startTime || null,
      endTime: insertCall.endTime || null,
      transcription: insertCall.transcription || null,
      sentiment: insertCall.sentiment || null,
    };
    this.calls.set(id, call);
    return call;
  }

  async getCall(id: string): Promise<Call | undefined> {
    return this.calls.get(id);
  }

  async updateCall(id: string, updates: Partial<Call>): Promise<boolean> {
    const call = this.calls.get(id);
    if (!call) return false;
    
    Object.assign(call, updates);
    this.calls.set(id, call);
    return true;
  }

  async getActiveCalls(): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(call => call.status === 'active');
  }

  async getCallsByStatus(status: string): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(call => call.status === status);
  }

  async getAllCalls(): Promise<Call[]> {
    return Array.from(this.calls.values());
  }

  // Appointment operations
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      createdAt: new Date(),
      status: insertAppointment.status || "scheduled",
      email: insertAppointment.email || null,
      phoneNumber: insertAppointment.phoneNumber || null,
      notes: insertAppointment.notes || null,
      createdByCallId: insertAppointment.createdByCallId || null,
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<boolean> {
    const appointment = this.appointments.get(id);
    if (!appointment) return false;
    
    Object.assign(appointment, updates);
    this.appointments.set(id, appointment);
    return true;
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    const now = new Date();
    return Array.from(this.appointments.values())
      .filter(appt => new Date(appt.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const dateKey = this.getDateKey(date);
    return Array.from(this.appointments.values())
      .filter(appt => this.getDateKey(new Date(appt.date)) === dateKey);
  }

  // Analytics operations
  async createAnalyticsEntry(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = { 
      ...insertAnalytics, 
      id,
      date: insertAnalytics.date || new Date(),
      totalCalls: insertAnalytics.totalCalls || 0,
      answeredCalls: insertAnalytics.answeredCalls || 0,
      avgResponseTime: insertAnalytics.avgResponseTime || 0,
      customerSatisfaction: insertAnalytics.customerSatisfaction || 0,
      aiHandledCalls: insertAnalytics.aiHandledCalls || 0,
      transferredCalls: insertAnalytics.transferredCalls || 0,
    };
    const dateKey = this.getDateKey(analytics.date);
    this.analytics.set(dateKey, analytics);
    return analytics;
  }

  async getAnalyticsByDate(date: Date): Promise<Analytics | undefined> {
    const dateKey = this.getDateKey(date);
    return this.analytics.get(dateKey);
  }

  async getTodayAnalytics(): Promise<Analytics | undefined> {
    return this.getAnalyticsByDate(new Date());
  }
}

class DbStorage implements IStorage {
  private async getDb(): Promise<DrizzleDb> {
    const mod = await import("./db");
    return mod.db as DrizzleDb;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [row] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return row as unknown as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [row] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return row as unknown as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const [row] = await db.insert(schema.users).values({
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name,
      role: insertUser.role || "agent",
      avatar: insertUser.avatar || null,
      status: insertUser.status || "available",
      brandId: insertUser.brandId || null,
    }).returning();
    return row as unknown as User;
  }

  async updateUserStatus(id: string, status: string): Promise<boolean> {
    const db = await this.getDb();
    const res = await db.update(schema.users).set({ status }).where(eq(schema.users.id, id));
    // drizzle returns {rowCount} in some drivers; fallback to truthy
    // @ts-ignore
    return Boolean(res.rowCount ?? 1);
  }

  async getAllUsers(): Promise<User[]> {
    const db = await this.getDb();
    const rows = await db.select().from(schema.users);
    return rows as unknown as User[];
  }

  // Call operations
  async createCall(insertCall: InsertCall): Promise<Call> {
    const db = await this.getDb();
    const [row] = await db.insert(schema.calls).values({
      customerName: insertCall.customerName,
      phoneNumber: insertCall.phoneNumber,
      purpose: insertCall.purpose || "Unknown",
      status: insertCall.status || "queued",
      assignedAgentId: insertCall.assignedAgentId || null,
      startTime: insertCall.startTime || null,
      endTime: insertCall.endTime || null,
      duration: insertCall.duration || null,
      transcription: insertCall.transcription || null,
      sentiment: insertCall.sentiment || null,
      isAiHandled: insertCall.isAiHandled !== undefined ? insertCall.isAiHandled : true,
    }).returning();
    return row as unknown as Call;
  }

  async getCall(id: string): Promise<Call | undefined> {
    const db = await this.getDb();
    const [row] = await db.select().from(schema.calls).where(eq(schema.calls.id, id));
    return row as unknown as Call | undefined;
  }

  async updateCall(id: string, updates: Partial<Call>): Promise<boolean> {
    const db = await this.getDb();
    const res = await db.update(schema.calls).set(updates as any).where(eq(schema.calls.id, id));
    // @ts-ignore
    return Boolean(res.rowCount ?? 1);
  }

  async getActiveCalls(): Promise<Call[]> {
    const db = await this.getDb();
    const rows = await db.select().from(schema.calls).where(eq(schema.calls.status, "active"));
    return rows as unknown as Call[];
  }

  async getCallsByStatus(status: string): Promise<Call[]> {
    const db = await this.getDb();
    const rows = await db.select().from(schema.calls).where(eq(schema.calls.status, status));
    return rows as unknown as Call[];
  }

  async getAllCalls(): Promise<Call[]> {
    const db = await this.getDb();
    const rows = await db.select().from(schema.calls);
    return rows as unknown as Call[];
  }

  // Appointment operations
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const db = await this.getDb();
    const [row] = await db.insert(schema.appointments).values({
      customerName: insertAppointment.customerName,
      phoneNumber: insertAppointment.phoneNumber || null,
      email: insertAppointment.email || null,
      service: insertAppointment.service,
      date: insertAppointment.date,
      status: insertAppointment.status || "scheduled",
      notes: insertAppointment.notes || null,
      createdByCallId: insertAppointment.createdByCallId || null,
    }).returning();
    return row as unknown as Appointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const db = await this.getDb();
    const [row] = await db.select().from(schema.appointments).where(eq(schema.appointments.id, id));
    return row as unknown as Appointment | undefined;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<boolean> {
    const db = await this.getDb();
    const res = await db.update(schema.appointments).set(updates as any).where(eq(schema.appointments.id, id));
    // @ts-ignore
    return Boolean(res.rowCount ?? 1);
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    const db = await this.getDb();
    const now = new Date();
    const rows = await db.select().from(schema.appointments).where(gt(schema.appointments.date, now)).orderBy(schema.appointments.date);
    return rows as unknown as Appointment[];
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const db = await this.getDb();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const rows = await db.select().from(schema.appointments).where(and(gte(schema.appointments.date, start), lt(schema.appointments.date, end)));
    return rows as unknown as Appointment[];
  }

  // Analytics operations
  async createAnalyticsEntry(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const db = await this.getDb();
    const [row] = await db.insert(schema.analytics).values({
      date: insertAnalytics.date || new Date(),
      totalCalls: insertAnalytics.totalCalls || 0,
      answeredCalls: insertAnalytics.answeredCalls || 0,
      avgResponseTime: insertAnalytics.avgResponseTime || 0,
      customerSatisfaction: insertAnalytics.customerSatisfaction || 0,
      aiHandledCalls: insertAnalytics.aiHandledCalls || 0,
      transferredCalls: insertAnalytics.transferredCalls || 0,
    }).returning();
    return row as unknown as Analytics;
  }

  async getAnalyticsByDate(date: Date): Promise<Analytics | undefined> {
    const db = await this.getDb();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const [row] = await db.select().from(schema.analytics).where(and(gte(schema.analytics.date, start), lt(schema.analytics.date, end)));
    return row as unknown as Analytics | undefined;
  }

  async getTodayAnalytics(): Promise<Analytics | undefined> {
    return this.getAnalyticsByDate(new Date());
  }
}

export const storage: IStorage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
