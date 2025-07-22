export interface User {
  id: number;
  email: string;
  role: 'admin' | 'advertiser' | 'partner';
  companyName?: string;
  contactPerson?: string;
  phoneNumber?: string;
}

export interface Campaign {
  id: number;
  advertiserId: number;
  title: string;
  description?: string;
  category: string;
  dailyBudget: string;
  totalBudget: string;
  targetFilters?: any;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  campaignStartDate: string;
  campaignEndDate: string;
  status: 'draft' | 'recruiting' | 'active' | 'completed' | 'cancelled';
  maxPartners: number;
  selectedPartners: number;
  qrCodeUrl?: string;
  productUrl?: string;
  createdAt: string;
}

export interface CampaignApplication {
  id: number;
  campaignId: number;
  partnerId: number;
  status: 'pending' | 'approved' | 'rejected';
  applicationMessage?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
}

export interface SampleProduct {
  id: number;
  campaignId: number;
  partnerId: number;
  productName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered';
  requestedAt: string;
  approvedAt?: string;
  shippedAt?: string;
  trackingNumber?: string;
}

export interface ShippingRecord {
  id: number;
  campaignId: number;
  partnerId: number;
  shippingDate: string;
  trackingNumber: string;
  productName: string;
  recipientInfo?: any;
  memo?: string;
  status: 'shipped' | 'delivered' | 'failed';
  createdAt: string;
}

export interface PerformanceMetric {
  id: number;
  campaignId: number;
  partnerId?: number;
  date: string;
  qrScans: number;
  conversions: number;
  revenue: string;
  deliveryRate: string;
  createdAt: string;
}

export interface AdminStats {
  totalCampaigns: number;
  activePartners: number;
  monthlyRevenue: string;
  successRate: string;
}

export const CATEGORIES = [
  "뷰티/화장품",
  "식품/건강",
  "패션/의류",
  "디지털/가전",
  "생활용품",
  "스포츠/레저",
  "육아/완구",
  "반려동물",
  "도서/문구",
  "기타"
];

export const AGE_GROUPS = [
  "10대",
  "20대",
  "30대",
  "40대",
  "50대",
  "60대 이상"
];

export const REGIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주"
];
