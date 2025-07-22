import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for authentication and role management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin', 'advertiser', 'partner'
  companyName: text("company_name"),
  contactPerson: text("contact_person"),
  phoneNumber: text("phone_number"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  website: text("website"),
  socialLinks: jsonb("social_links"), // Instagram, YouTube, Blog URLs
  specialties: text("specialties").array(), // Areas of expertise
  followerCount: integer("follower_count").default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  advertiserId: integer("advertiser_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  dailyBudget: decimal("daily_budget", { precision: 12, scale: 2 }).notNull(),
  totalBudget: decimal("total_budget", { precision: 12, scale: 2 }).notNull(),
  targetFilters: jsonb("target_filters"), // ages, regions, interests
  recruitmentStartDate: timestamp("recruitment_start_date").notNull(),
  recruitmentEndDate: timestamp("recruitment_end_date").notNull(),
  campaignStartDate: timestamp("campaign_start_date").notNull(),
  campaignEndDate: timestamp("campaign_end_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, recruiting, active, completed, cancelled
  maxPartners: integer("max_partners").default(10),
  selectedPartners: integer("selected_partners").default(0),
  qrCodeUrl: text("qr_code_url"),
  productUrl: text("product_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign applications from partners
export const campaignApplications = pgTable("campaign_applications", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  applicationMessage: text("application_message"),
  appliedAt: timestamp("applied_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
});

// Sample products management
export const sampleProducts = pgTable("sample_products", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, shipped, delivered
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  shippedAt: timestamp("shipped_at"),
  trackingNumber: text("tracking_number"),
});

// Shipping records
export const shippingRecords = pgTable("shipping_records", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  shippingDate: timestamp("shipping_date").notNull(),
  trackingNumber: text("tracking_number").notNull(),
  productName: text("product_name").notNull(),
  recipientInfo: jsonb("recipient_info"), // name, address, phone
  memo: text("memo"),
  status: text("status").notNull().default("shipped"), // shipped, delivered, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance tracking
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  partnerId: integer("partner_id"),
  date: timestamp("date").notNull(),
  qrScans: integer("qr_scans").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  deliveryRate: decimal("delivery_rate", { precision: 5, scale: 2 }).default("0"), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner delivery categories and performance history
export const partnerCategories = pgTable("partner_categories", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  category: text("category").notNull(),
  deliveryCapacity: integer("delivery_capacity").notNull(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
});

// Payment and billing system
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  advertiserId: integer("advertiser_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method").notNull(), // card, bank_transfer, etc
  transactionId: text("transaction_id"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner earnings
export const partnerEarnings = pgTable("partner_earnings", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  campaignId: integer("campaign_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, failed
  earnedAt: timestamp("earned_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
  applications: many(campaignApplications),
  sampleProducts: many(sampleProducts),
  shippingRecords: many(shippingRecords),
  partnerCategories: many(partnerCategories),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [campaigns.advertiserId],
    references: [users.id],
  }),
  applications: many(campaignApplications),
  sampleProducts: many(sampleProducts),
  shippingRecords: many(shippingRecords),
  performanceMetrics: many(performanceMetrics),
}));

export const campaignApplicationsRelations = relations(campaignApplications, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignApplications.campaignId],
    references: [campaigns.id],
  }),
  partner: one(users, {
    fields: [campaignApplications.partnerId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [campaignApplications.reviewedBy],
    references: [users.id],
  }),
}));

export const sampleProductsRelations = relations(sampleProducts, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [sampleProducts.campaignId],
    references: [campaigns.id],
  }),
  partner: one(users, {
    fields: [sampleProducts.partnerId],
    references: [users.id],
  }),
}));

export const shippingRecordsRelations = relations(shippingRecords, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [shippingRecords.campaignId],
    references: [campaigns.id],
  }),
  partner: one(users, {
    fields: [shippingRecords.partnerId],
    references: [users.id],
  }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [performanceMetrics.campaignId],
    references: [campaigns.id],
  }),
  partner: one(users, {
    fields: [performanceMetrics.partnerId],
    references: [users.id],
  }),
}));

export const partnerCategoriesRelations = relations(partnerCategories, ({ one }) => ({
  partner: one(users, {
    fields: [partnerCategories.partnerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  selectedPartners: true,
});

export const insertCampaignApplicationSchema = createInsertSchema(campaignApplications).omit({
  id: true,
  appliedAt: true,
  reviewedAt: true,
});

export const insertSampleProductSchema = createInsertSchema(sampleProducts).omit({
  id: true,
  requestedAt: true,
  approvedAt: true,
  shippedAt: true,
});

export const insertShippingRecordSchema = createInsertSchema(shippingRecords).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerCategorySchema = createInsertSchema(partnerCategories).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type CampaignApplication = typeof campaignApplications.$inferSelect;
export type InsertCampaignApplication = z.infer<typeof insertCampaignApplicationSchema>;
export type SampleProduct = typeof sampleProducts.$inferSelect;
export type InsertSampleProduct = z.infer<typeof insertSampleProductSchema>;
export type ShippingRecord = typeof shippingRecords.$inferSelect;
export type InsertShippingRecord = z.infer<typeof insertShippingRecordSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type PartnerCategory = typeof partnerCategories.$inferSelect;
export type InsertPartnerCategory = z.infer<typeof insertPartnerCategorySchema>;

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertPartnerEarningSchema = createInsertSchema(partnerEarnings).omit({
  id: true,
  earnedAt: true,
  paidAt: true,
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type PartnerEarning = typeof partnerEarnings.$inferSelect;
export type InsertPartnerEarning = z.infer<typeof insertPartnerEarningSchema>;
