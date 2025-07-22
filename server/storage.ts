import { 
  users, 
  campaigns, 
  campaignApplications, 
  sampleProducts, 
  shippingRecords, 
  performanceMetrics,
  partnerCategories,
  payments,
  partnerEarnings,
  type User, 
  type InsertUser,
  type Campaign,
  type InsertCampaign,
  type CampaignApplication,
  type InsertCampaignApplication,
  type SampleProduct,
  type InsertSampleProduct,
  type ShippingRecord,
  type InsertShippingRecord,
  type PerformanceMetric,
  type InsertPerformanceMetric,
  type PartnerCategory,
  type InsertPartnerCategory,
  type Payment,
  type InsertPayment,
  type PartnerEarning,
  type InsertPartnerEarning
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, count, sum } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;

  // Campaign management
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByAdvertiser(advertiserId: number): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Campaign applications
  createCampaignApplication(application: InsertCampaignApplication): Promise<CampaignApplication>;
  getCampaignApplications(campaignId: number): Promise<CampaignApplication[]>;
  getPartnerApplications(partnerId: number): Promise<CampaignApplication[]>;
  updateApplicationStatus(id: number, status: string, reviewedBy: number): Promise<CampaignApplication | undefined>;

  // Sample products
  createSampleProduct(sampleProduct: InsertSampleProduct): Promise<SampleProduct>;
  getSampleProductsByPartner(partnerId: number): Promise<SampleProduct[]>;
  getSampleProductsByCampaign(campaignId: number): Promise<SampleProduct[]>;
  updateSampleProductStatus(id: number, status: string): Promise<SampleProduct | undefined>;

  // Shipping records
  createShippingRecord(shippingRecord: InsertShippingRecord): Promise<ShippingRecord>;
  getShippingRecordsByPartner(partnerId: number): Promise<ShippingRecord[]>;
  getShippingRecordsByCampaign(campaignId: number): Promise<ShippingRecord[]>;
  getShippingRecordsByDateRange(startDate: Date, endDate: Date): Promise<ShippingRecord[]>;

  // Performance metrics
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  getPerformanceMetrics(campaignId: number, partnerId?: number): Promise<PerformanceMetric[]>;
  getPerformanceMetricsByDateRange(startDate: Date, endDate: Date, campaignId?: number): Promise<PerformanceMetric[]>;

  // Partner categories
  createPartnerCategory(category: InsertPartnerCategory): Promise<PartnerCategory>;
  getPartnerCategories(partnerId: number): Promise<PartnerCategory[]>;
  updatePartnerCategory(id: number, category: Partial<InsertPartnerCategory>): Promise<PartnerCategory | undefined>;

  // Payment management
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByAdvertiser(advertiserId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;

  // Partner earnings
  getPartnerEarnings(partnerId: number): Promise<PartnerEarning[]>;
  getAllPartnerEarnings(): Promise<PartnerEarning[]>;

  // Partner management
  getAllPartners(): Promise<User[]>;
  updatePartnerStatus(partnerId: number, isActive: boolean): Promise<User | undefined>;
  createBulkShippingRecords(records: InsertShippingRecord[]): Promise<ShippingRecord[]>;

  // Dashboard analytics
  getAdminStats(): Promise<{
    totalCampaigns: number;
    activePartners: number;
    monthlyRevenue: string;
    successRate: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Campaign management
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaignsByAdvertiser(advertiserId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.advertiserId, advertiserId)).orderBy(desc(campaigns.createdAt));
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const now = new Date();
    return await db.select().from(campaigns).where(
      and(
        eq(campaigns.status, "recruiting"),
        lte(campaigns.recruitmentStartDate, now),
        gte(campaigns.recruitmentEndDate, now)
      )
    ).orderBy(desc(campaigns.createdAt));
  }

  async updateCampaign(id: number, updateData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [campaign] = await db.update(campaigns).set(updateData).where(eq(campaigns.id, id)).returning();
    return campaign || undefined;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return result.rowCount > 0;
  }

  // Campaign applications
  async createCampaignApplication(insertApplication: InsertCampaignApplication): Promise<CampaignApplication> {
    const [application] = await db.insert(campaignApplications).values(insertApplication).returning();
    return application;
  }

  async getCampaignApplications(campaignId: number): Promise<CampaignApplication[]> {
    return await db.select().from(campaignApplications).where(eq(campaignApplications.campaignId, campaignId));
  }

  async getPartnerApplications(partnerId: number): Promise<CampaignApplication[]> {
    return await db.select().from(campaignApplications).where(eq(campaignApplications.partnerId, partnerId));
  }

  async updateApplicationStatus(id: number, status: string, reviewedBy: number): Promise<CampaignApplication | undefined> {
    const [application] = await db.update(campaignApplications).set({
      status,
      reviewedBy,
      reviewedAt: new Date()
    }).where(eq(campaignApplications.id, id)).returning();
    return application || undefined;
  }

  // Sample products
  async createSampleProduct(insertSampleProduct: InsertSampleProduct): Promise<SampleProduct> {
    const [sampleProduct] = await db.insert(sampleProducts).values(insertSampleProduct).returning();
    return sampleProduct;
  }

  async getSampleProductsByPartner(partnerId: number): Promise<SampleProduct[]> {
    return await db.select().from(sampleProducts).where(eq(sampleProducts.partnerId, partnerId));
  }

  async getSampleProductsByCampaign(campaignId: number): Promise<SampleProduct[]> {
    return await db.select().from(sampleProducts).where(eq(sampleProducts.campaignId, campaignId));
  }

  async updateSampleProductStatus(id: number, status: string): Promise<SampleProduct | undefined> {
    const updateData: any = { status };
    if (status === "approved") {
      updateData.approvedAt = new Date();
    } else if (status === "shipped") {
      updateData.shippedAt = new Date();
    }
    
    const [sampleProduct] = await db.update(sampleProducts).set(updateData).where(eq(sampleProducts.id, id)).returning();
    return sampleProduct || undefined;
  }

  // Shipping records
  async createShippingRecord(insertShippingRecord: InsertShippingRecord): Promise<ShippingRecord> {
    const [shippingRecord] = await db.insert(shippingRecords).values(insertShippingRecord).returning();
    return shippingRecord;
  }

  async getShippingRecordsByPartner(partnerId: number): Promise<ShippingRecord[]> {
    return await db.select().from(shippingRecords).where(eq(shippingRecords.partnerId, partnerId)).orderBy(desc(shippingRecords.createdAt));
  }

  async getShippingRecordsByCampaign(campaignId: number): Promise<ShippingRecord[]> {
    return await db.select().from(shippingRecords).where(eq(shippingRecords.campaignId, campaignId)).orderBy(desc(shippingRecords.createdAt));
  }

  async getShippingRecordsByDateRange(startDate: Date, endDate: Date): Promise<ShippingRecord[]> {
    return await db.select().from(shippingRecords).where(
      and(
        gte(shippingRecords.shippingDate, startDate),
        lte(shippingRecords.shippingDate, endDate)
      )
    ).orderBy(desc(shippingRecords.shippingDate));
  }

  // Performance metrics
  async createPerformanceMetric(insertMetric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const [metric] = await db.insert(performanceMetrics).values(insertMetric).returning();
    return metric;
  }

  async getPerformanceMetrics(campaignId: number, partnerId?: number): Promise<PerformanceMetric[]> {
    const conditions = [eq(performanceMetrics.campaignId, campaignId)];
    if (partnerId) {
      conditions.push(eq(performanceMetrics.partnerId, partnerId));
    }
    return await db.select().from(performanceMetrics).where(and(...conditions)).orderBy(desc(performanceMetrics.date));
  }

  async getPerformanceMetricsByDateRange(startDate: Date, endDate: Date, campaignId?: number): Promise<PerformanceMetric[]> {
    const conditions = [
      gte(performanceMetrics.date, startDate),
      lte(performanceMetrics.date, endDate)
    ];
    if (campaignId) {
      conditions.push(eq(performanceMetrics.campaignId, campaignId));
    }
    return await db.select().from(performanceMetrics).where(and(...conditions)).orderBy(desc(performanceMetrics.date));
  }

  // Partner categories
  async createPartnerCategory(insertCategory: InsertPartnerCategory): Promise<PartnerCategory> {
    const [category] = await db.insert(partnerCategories).values(insertCategory).returning();
    return category;
  }

  async getPartnerCategories(partnerId: number): Promise<PartnerCategory[]> {
    return await db.select().from(partnerCategories).where(eq(partnerCategories.partnerId, partnerId));
  }

  async updatePartnerCategory(id: number, updateData: Partial<InsertPartnerCategory>): Promise<PartnerCategory | undefined> {
    const [category] = await db.update(partnerCategories).set(updateData).where(eq(partnerCategories.id, id)).returning();
    return category || undefined;
  }

  // Payment management
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async getPaymentsByAdvertiser(advertiserId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.advertiserId, advertiserId)).orderBy(desc(payments.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined> {
    const updateData: any = { status, processedAt: new Date() };
    if (transactionId) updateData.transactionId = transactionId;
    
    const [payment] = await db.update(payments).set(updateData).where(eq(payments.id, id)).returning();
    return payment || undefined;
  }

  // Partner earnings management
  async createPartnerEarning(insertEarning: InsertPartnerEarning): Promise<PartnerEarning> {
    const [earning] = await db.insert(partnerEarnings).values(insertEarning).returning();
    return earning;
  }

  async getPartnerEarnings(partnerId: number): Promise<PartnerEarning[]> {
    return await db.select().from(partnerEarnings).where(eq(partnerEarnings.partnerId, partnerId)).orderBy(desc(partnerEarnings.earnedAt));
  }

  async getAllPartnerEarnings(): Promise<PartnerEarning[]> {
    return await db.select().from(partnerEarnings).orderBy(desc(partnerEarnings.earnedAt));
  }

  async updatePartnerEarningStatus(id: number, status: string): Promise<PartnerEarning | undefined> {
    const updateData: any = { status };
    if (status === 'paid') updateData.paidAt = new Date();
    
    const [earning] = await db.update(partnerEarnings).set(updateData).where(eq(partnerEarnings.id, id)).returning();
    return earning || undefined;
  }

  // Partner management
  async getAllPartners(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'partner')).orderBy(desc(users.createdAt));
  }

  async updatePartnerStatus(partnerId: number, isActive: boolean): Promise<User | undefined> {
    const [user] = await db.update(users).set({ isActive }).where(eq(users.id, partnerId)).returning();
    return user || undefined;
  }

  async createBulkShippingRecords(records: InsertShippingRecord[]): Promise<ShippingRecord[]> {
    const createdRecords = await db.insert(shippingRecords).values(records).returning();
    return createdRecords;
  }

  // Dashboard analytics
  async getAdminStats(): Promise<{
    totalCampaigns: number;
    activePartners: number;
    monthlyRevenue: string;
    successRate: string;
  }> {
    const totalCampaignsResult = await db.select({ count: count() }).from(campaigns);
    const activePartnersResult = await db.select({ count: count() }).from(users).where(and(eq(users.role, "partner"), eq(users.isActive, true)));
    
    // Calculate actual monthly revenue from performance metrics
    const currentMonth = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const revenueResult = await db.select({ 
      totalRevenue: sum(performanceMetrics.revenue) 
    }).from(performanceMetrics).where(
      and(
        gte(performanceMetrics.date, firstDay),
        lte(performanceMetrics.date, lastDay)
      )
    );
    
    // Calculate success rate from shipping records
    const totalShippedResult = await db.select({ count: count() }).from(shippingRecords);
    const successfulDeliveries = await db.select({ count: count() }).from(shippingRecords).where(eq(shippingRecords.status, 'delivered'));
    
    const totalShipped = totalShippedResult[0]?.count || 0;
    const successRate = totalShipped > 0 ? ((successfulDeliveries[0]?.count || 0) / totalShipped * 100).toFixed(1) : "0";
    
    return {
      totalCampaigns: totalCampaignsResult[0]?.count || 0,
      activePartners: activePartnersResult[0]?.count || 0,
      monthlyRevenue: revenueResult[0]?.totalRevenue?.toString() || "0",
      successRate: successRate
    };
  }
}

export const storage = new DatabaseStorage();
