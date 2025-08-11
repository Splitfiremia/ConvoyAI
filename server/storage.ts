import { type User, type InsertUser, type Call, type InsertCall, type Appointment, type InsertAppointment, type Analytics, type InsertAnalytics } from "@shared/schema";
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

export const storage = new MemStorage();
