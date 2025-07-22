import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Calendar, Download, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Mock data for revenue
const monthlyRevenue = [
  { month: '1월', revenue: 1200000, campaigns: 5 },
  { month: '2월', revenue: 1800000, campaigns: 7 },
  { month: '3월', revenue: 2100000, campaigns: 8 },
  { month: '4월', revenue: 1900000, campaigns: 6 },
  { month: '5월', revenue: 2500000, campaigns: 10 },
  { month: '6월', revenue: 2800000, campaigns: 12 },
];

const campaignRevenue = [
  { name: '개발자 모집 캠페인', revenue: 850000, status: 'completed' },
  { name: '신제품 리뷰 캠페인', revenue: 620000, status: 'active' },
  { name: '브랜드 체험 캠페인', revenue: 1200000, status: 'completed' },
  { name: '여름 특집 캠페인', revenue: 340000, status: 'pending' },
];

interface PartnerEarning {
  id: number;
  partnerId: number;
  campaignId: number;
  amount: string;
  status: string;
  earnedAt: string;
  paidAt?: string;
}

export default function RevenuePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const { data: earnings, isLoading } = useQuery<PartnerEarning[]>({
    queryKey: ["/api/partner-earnings"],
  });

  const totalRevenue = earnings?.reduce((sum, earning) => sum + parseFloat(earning.amount), 0) || 0;
  const paidEarnings = earnings?.filter(e => e.status === 'paid') || [];
  const pendingEarnings = earnings?.filter(e => e.status === 'pending') || [];
  const thisMonthEarnings = earnings?.filter(e => {
    const earnedDate = new Date(e.earnedAt);
    const now = new Date();
    return earnedDate.getMonth() === now.getMonth() && earnedDate.getFullYear() === now.getFullYear();
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { label: "완료", variant: "outline" as const },
      active: { label: "진행중", variant: "default" as const },
      pending: { label: "정산 대기", variant: "secondary" as const },
      paid: { label: "정산완료", variant: "secondary" as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">수익 리포트</h1>
          <p className="text-gray-500">파트너 활동으로 발생한 수익을 분석하고 추적합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3개월</SelectItem>
              <SelectItem value="6months">6개월</SelectItem>
              <SelectItem value="1year">1년</SelectItem>
            </SelectContent>
          </Select>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 수익</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₩{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">전체 누적</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">지급완료</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₩{paidEarnings.reduce((sum, e) => sum + parseFloat(e.amount), 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">정산완료 수익</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">지급대기</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₩{pendingEarnings.reduce((sum, e) => sum + parseFloat(e.amount), 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">정산 대기 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">이번 달 수익</CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₩{thisMonthEarnings.reduce((sum, e) => sum + parseFloat(e.amount), 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{new Date().getMonth() + 1}월 수익</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>월별 수익 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value: any) => [`₩${value.toLocaleString()}`, '수익']}
                  labelFormatter={(label) => `${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Campaign Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>캠페인별 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignRevenue.map((campaign, index) => {
                const statusInfo = getStatusBadge(campaign.status);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ₩{campaign.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Campaign Count */}
        <Card>
          <CardHeader>
            <CardTitle>월별 캠페인 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="campaigns" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>최근 정산 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-06-15', amount: 850000, campaign: '개발자 모집 캠페인', status: 'paid' },
              { date: '2024-06-01', amount: 620000, campaign: '신제품 리뷰 캠페인', status: 'paid' },
              { date: '2024-05-15', amount: 1200000, campaign: '브랜드 체험 캠페인', status: 'paid' },
              { date: '2024-05-01', amount: 340000, campaign: '여름 특집 캠페인', status: 'pending' },
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{payment.campaign}</div>
                  <div className="text-sm text-gray-500">{payment.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ₩{payment.amount.toLocaleString()}
                  </div>
                  <Badge variant={payment.status === 'paid' ? 'outline' : 'secondary'}>
                    {payment.status === 'paid' ? '지급완료' : '지급대기'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}