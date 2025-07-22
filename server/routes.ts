import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import Stripe from "stripe";
import { insertUserSchema, insertCampaignSchema, insertCampaignApplicationSchema, insertShippingRecordSchema, insertSampleProductSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe conditionally
  const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      })
    : null;

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'allreview-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "인증이 필요합니다" });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.session?.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "권한이 없습니다" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "잘못된 이메일 또는 비밀번호입니다" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "잘못된 이메일 또는 비밀번호입니다" });
      }

      req.session.user = { id: user.id, email: user.email, role: user.role, companyName: user.companyName };
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          companyName: user.companyName 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "로그인 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log('Signup request body:', req.body);
      
      // Basic validation first
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ 
          success: false, 
          message: "잘못된 요청 데이터입니다" 
        });
      }

      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "이미 존재하는 이메일입니다" 
        });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      req.session.user = { id: user.id, email: user.email, role: user.role, companyName: user.companyName };
      console.log('User created successfully:', user.id, user.email);
      
      return res.status(201).json({ 
        success: true,
        message: "회원가입이 완료되었습니다",
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          companyName: user.companyName 
        } 
      });
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = "회원가입 중 오류가 발생했습니다";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return res.status(400).json({ 
        success: false,
        message: errorMessage
      });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다" });
      }
      res.json({ message: "로그아웃되었습니다" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session?.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: "인증되지 않음" });
    }
  });

  // Campaign routes
  app.post("/api/campaigns", requireAuth, requireRole(['advertiser', 'admin']), async (req, res) => {
    try {
      console.log("Received campaign data:", req.body);
      
      // Convert string dates to Date objects and handle numeric fields
      const processedData = {
        ...req.body,
        advertiserId: req.session.user.role === 'admin' ? req.body.advertiserId || req.session.user.id : req.session.user.id,
        dailyBudget: typeof req.body.dailyBudget === 'string' ? req.body.dailyBudget : String(req.body.dailyBudget),
        totalBudget: typeof req.body.totalBudget === 'string' ? req.body.totalBudget : String(req.body.totalBudget),
        maxPartners: typeof req.body.maxPartners === 'number' ? req.body.maxPartners : parseInt(req.body.maxPartners),
        recruitmentStartDate: new Date(req.body.recruitmentStartDate),
        recruitmentEndDate: new Date(req.body.recruitmentEndDate),
        campaignStartDate: new Date(req.body.campaignStartDate),
        campaignEndDate: new Date(req.body.campaignEndDate),
      };
      
      console.log("Processed campaign data:", processedData);
      
      const campaignData = insertCampaignSchema.parse(processedData);
      console.log("Parsed campaign data:", campaignData);
      
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Campaign creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: "캠페인 생성 중 오류가 발생했습니다", error: error.message });
      } else {
        res.status(400).json({ message: "캠페인 생성 중 오류가 발생했습니다" });
      }
    }
  });

  app.get("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const { role, id } = req.session.user;
      let campaigns;

      if (role === 'admin') {
        // Admin can see all campaigns - implement if needed
        campaigns = [];
      } else if (role === 'advertiser') {
        campaigns = await storage.getCampaignsByAdvertiser(id);
      } else if (role === 'partner') {
        campaigns = await storage.getActiveCampaigns();
      }

      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "캠페인 조회 중 오류가 발생했습니다" });
    }
  });

  app.get("/api/campaigns/:id", requireAuth, async (req, res) => {
    try {
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      if (!campaign) {
        return res.status(404).json({ message: "캠페인을 찾을 수 없습니다" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "캠페인 조회 중 오류가 발생했습니다" });
    }
  });

  app.put("/api/campaigns/:id", requireAuth, requireRole(['advertiser', 'admin']), async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(parseInt(req.params.id), req.body);
      if (!campaign) {
        return res.status(404).json({ message: "캠페인을 찾을 수 없습니다" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "캠페인 수정 중 오류가 발생했습니다" });
    }
  });

  // Campaign application routes
  app.post("/api/campaigns/:id/apply", requireAuth, requireRole(['partner']), async (req, res) => {
    try {
      const applicationData = insertCampaignApplicationSchema.parse({
        campaignId: parseInt(req.params.id),
        partnerId: req.session.user.id,
        applicationMessage: req.body.applicationMessage
      });

      const application = await storage.createCampaignApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: "캠페인 신청 중 오류가 발생했습니다" });
    }
  });

  app.get("/api/campaigns/:id/applications", requireAuth, requireRole(['advertiser', 'admin']), async (req, res) => {
    try {
      const applications = await storage.getCampaignApplications(parseInt(req.params.id));
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "신청 목록 조회 중 오류가 발생했습니다" });
    }
  });

  app.put("/api/applications/:id/status", requireAuth, requireRole(['advertiser', 'admin']), async (req, res) => {
    try {
      const { status } = req.body;
      const application = await storage.updateApplicationStatus(
        parseInt(req.params.id), 
        status, 
        req.session.user.id
      );
      if (!application) {
        return res.status(404).json({ message: "신청을 찾을 수 없습니다" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "신청 상태 변경 중 오류가 발생했습니다" });
    }
  });

  // Sample product routes
  app.post("/api/sample-products", requireAuth, requireRole(['partner']), async (req, res) => {
    try {
      const sampleData = insertSampleProductSchema.parse({
        ...req.body,
        partnerId: req.session.user.id
      });
      
      const sampleProduct = await storage.createSampleProduct(sampleData);
      res.status(201).json(sampleProduct);
    } catch (error) {
      res.status(400).json({ message: "샘플 요청 중 오류가 발생했습니다" });
    }
  });

  app.get("/api/sample-products", requireAuth, async (req, res) => {
    try {
      const { role, id } = req.session.user;
      let sampleProducts;

      if (role === 'partner') {
        sampleProducts = await storage.getSampleProductsByPartner(id);
      } else {
        // For admin/advertiser, implement campaign-based filtering if needed
        sampleProducts = [];
      }

      res.json(sampleProducts);
    } catch (error) {
      res.status(500).json({ message: "샘플 목록 조회 중 오류가 발생했습니다" });
    }
  });

  app.put("/api/sample-products/:id/status", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const { status } = req.body;
      const sampleProduct = await storage.updateSampleProductStatus(parseInt(req.params.id), status);
      if (!sampleProduct) {
        return res.status(404).json({ message: "샘플을 찾을 수 없습니다" });
      }
      res.json(sampleProduct);
    } catch (error) {
      res.status(500).json({ message: "샘플 상태 변경 중 오류가 발생했습니다" });
    }
  });

  // Shipping record routes
  app.post("/api/shipping-records", requireAuth, requireRole(['partner']), async (req, res) => {
    try {
      const shippingData = insertShippingRecordSchema.parse({
        ...req.body,
        partnerId: req.session.user.id
      });
      
      const shippingRecord = await storage.createShippingRecord(shippingData);
      res.status(201).json(shippingRecord);
    } catch (error) {
      res.status(400).json({ message: "발송 등록 중 오류가 발생했습니다" });
    }
  });

  app.get("/api/shipping-records", requireAuth, async (req, res) => {
    try {
      const { role, id } = req.session.user;
      const { startDate, endDate } = req.query;
      let shippingRecords;

      if (role === 'partner') {
        shippingRecords = await storage.getShippingRecordsByPartner(id);
      } else if (startDate && endDate) {
        shippingRecords = await storage.getShippingRecordsByDateRange(
          new Date(startDate as string), 
          new Date(endDate as string)
        );
      } else {
        shippingRecords = [];
      }

      res.json(shippingRecords);
    } catch (error) {
      res.status(500).json({ message: "발송 기록 조회 중 오류가 발생했습니다" });
    }
  });

  // Performance metrics routes
  app.get("/api/performance-metrics", requireAuth, async (req, res) => {
    try {
      const { campaignId, startDate, endDate } = req.query;
      
      let metrics;
      if (startDate && endDate) {
        metrics = await storage.getPerformanceMetricsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string),
          campaignId ? parseInt(campaignId as string) : undefined
        );
      } else if (campaignId) {
        metrics = await storage.getPerformanceMetrics(parseInt(campaignId as string));
      } else {
        // Return all metrics for the user's campaigns if no specific campaign ID
        const userCampaigns = await storage.getCampaignsByAdvertiser(req.session.user.id);
        if (userCampaigns.length > 0) {
          // Get metrics for the first campaign
          metrics = await storage.getPerformanceMetrics(userCampaigns[0].id);
        } else {
          metrics = [];
        }
      }

      res.json(metrics);
    } catch (error) {
      console.error('Performance metrics error:', error);
      res.status(500).json({ message: "성과 데이터 조회 중 오류가 발생했습니다" });
    }
  });

  // Payment routes
  app.post("/api/payments", requireAuth, requireRole(['advertiser']), async (req, res) => {
    try {
      const { insertPaymentSchema } = await import("@shared/schema");
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        advertiserId: req.session.user.id
      });
      
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error('Payment creation error:', error);
      res.status(400).json({ message: "결제 처리 중 오류가 발생했습니다" });
    }
  });

  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const { role, id } = req.session.user;
      let payments;

      if (role === 'admin') {
        payments = await storage.getAllPayments();
      } else if (role === 'advertiser') {
        payments = await storage.getPaymentsByAdvertiser(id);
      } else {
        payments = [];
      }

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "결제 내역 조회 중 오류가 발생했습니다" });
    }
  });

  // Partner earnings routes
  app.get("/api/partner-earnings", requireAuth, requireRole(['partner', 'admin']), async (req, res) => {
    try {
      const { role, id } = req.session.user;
      let earnings;

      if (role === 'admin') {
        earnings = await storage.getAllPartnerEarnings();
      } else if (role === 'partner') {
        earnings = await storage.getPartnerEarnings(id);
      } else {
        earnings = [];
      }

      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "수익 조회 중 오류가 발생했습니다" });
    }
  });

  // Admin dashboard stats
  app.get("/api/admin/stats", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ message: "통계 조회 중 오류가 발생했습니다" });
    }
  });

  // Partner management routes
  app.get("/api/partners", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "파트너 목록 조회 중 오류가 발생했습니다" });
    }
  });

  app.put("/api/partners/:id/status", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const { isActive } = req.body;
      const partner = await storage.updatePartnerStatus(parseInt(req.params.id), isActive);
      if (!partner) {
        return res.status(404).json({ message: "파트너를 찾을 수 없습니다" });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ message: "파트너 상태 변경 중 오류가 발생했습니다" });
    }
  });

  // Bulk shipping record creation
  app.post("/api/shipping-records/bulk", requireAuth, requireRole(['partner']), async (req, res) => {
    try {
      const { records } = req.body;
      const shippingRecords = records.map((record: any) => ({
        ...record,
        partnerId: req.session.user.id
      }));
      
      const createdRecords = await storage.createBulkShippingRecords(shippingRecords);
      res.status(201).json(createdRecords);
    } catch (error) {
      res.status(400).json({ message: "일괄 발송 등록 중 오류가 발생했습니다" });
    }
  });

  // Stripe payment routes
  app.post("/api/payments/create-payment-intent", requireAuth, requireRole(['advertiser']), async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "결제 서비스가 구성되지 않았습니다" });
      }

      const { amount, currency = 'krw', campaignId } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          campaignId: campaignId.toString(),
          advertiserId: req.session.user.id.toString(),
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Create payment intent error:', error);
      res.status(500).json({ message: "결제 준비 중 오류가 발생했습니다: " + error.message });
    }
  });

  app.post("/api/payments/process", requireAuth, requireRole(['advertiser']), async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "결제 서비스가 구성되지 않았습니다" });
      }

      const { campaignId, amount, paymentMethodId } = req.body;

      // Confirm payment with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount in cents
        currency: 'krw',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${req.protocol}://${req.get('host')}/campaigns`,
        metadata: {
          campaignId: campaignId.toString(),
          advertiserId: req.session.user.id.toString(),
        },
      });

      if (paymentIntent.status === 'succeeded') {
        // Update campaign status to active
        await storage.updateCampaign(campaignId, { status: 'active' });
        
        // Create payment record
        const { insertPaymentSchema } = await import("@shared/schema");
        const paymentData = insertPaymentSchema.parse({
          advertiserId: req.session.user.id,
          campaignId,
          amount: amount / 100, // Convert back to dollars
          status: 'completed',
          paymentMethod: 'stripe',
          stripePaymentId: paymentIntent.id
        });
        
        await storage.createPayment(paymentData);
        
        res.json({ 
          success: true, 
          message: "결제가 완료되었습니다",
          paymentIntent: paymentIntent.id
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "결제 처리에 실패했습니다" 
        });
      }
    } catch (error: any) {
      console.error('Process payment error:', error);
      res.status(500).json({ 
        success: false, 
        message: "결제 처리 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
