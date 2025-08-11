import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("agent"),
  avatar: text("avatar"),
  status: text("status").notNull().default("available"), // available, busy, on_call, break, offline
  brandId: varchar("brand_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const calls = pgTable("calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("queued"), // queued, active, completed, transferred
  assignedAgentId: varchar("assigned_agent_id").references(() => users.id),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  transcription: text("transcription"),
  sentiment: json("sentiment").$type<{rating: number, confidence: number}>(),
  isAiHandled: boolean("is_ai_handled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  service: text("service").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, confirmed, pending, cancelled, completed
  notes: text("notes"),
  createdByCallId: varchar("created_by_call_id").references(() => calls.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().default(sql`now()`),
  totalCalls: integer("total_calls").notNull().default(0),
  answeredCalls: integer("answered_calls").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0), // in seconds
  customerSatisfaction: integer("customer_satisfaction").notNull().default(0), // percentage
  aiHandledCalls: integer("ai_handled_calls").notNull().default(0),
  transferredCalls: integer("transferred_calls").notNull().default(0),
});

// White Label Tables
export const brands = pgTable("brands", {
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
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const brandSettings = pgTable("brand_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").notNull(),
  serviceType: text("service_type").notNull(), // 'voice', 'email', 'mobile'
  settings: json("settings").$type<{
    voice?: {
      wakeWords?: string[];
      voicePersona?: string;
      customGreeting?: string;
    };
    email?: {
      senderDomain?: string;
      emailTemplates?: Record<string, string>;
      supportPortalUrl?: string;
    };
    mobile?: {
      packageName?: string;
      appStoreName?: string;
      customTLD?: string;
      pushNotificationStyle?: Record<string, string>;
    };
  }>(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  brandId: varchar("brand_id"),
  plan: text("plan").notNull(), // 'starter', 'professional', 'enterprise'
  whiteLabelAddon: boolean("white_label_addon").default(false),
  status: text("status").notNull().default("active"), // 'active', 'cancelled', 'expired'
  trialEnd: timestamp("trial_end"),
  currentPeriodStart: timestamp("current_period_start").notNull().default(sql`now()`),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

// Relations
export const brandsRelations = relations(brands, ({ many }) => ({
  settings: many(brandSettings),
  users: many(users),
  subscriptions: many(subscriptions),
}));

export const brandSettingsRelations = relations(brandSettings, ({ one }) => ({
  brand: one(brands, {
    fields: [brandSettings.brandId],
    references: [brands.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  brand: one(brands, {
    fields: [users.brandId],
    references: [brands.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  brand: one(brands, {
    fields: [subscriptions.brandId],
    references: [brands.id],
  }),
}));

// White Label Schemas
export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandSettingsSchema = createInsertSchema(brandSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type BrandSettings = typeof brandSettings.$inferSelect;
export type InsertBrandSettings = z.infer<typeof insertBrandSettingsSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
