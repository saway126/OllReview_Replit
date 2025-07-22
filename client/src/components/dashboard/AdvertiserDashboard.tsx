import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@/types";
import { TrendingUp, Clock, CheckCircle, DollarSign, BarChart3, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function AdvertiserDashboard() {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Fetch performance metrics for quick stats
  const { data: performanceData } = useQuery({
    queryKey: ["/api/performance-metrics"],
    queryFn: async () => {
      if (!campaigns?.[0]?.id) return [];
      const params = new URLSearchParams({ campaignId: campaigns[0].id.toString() });
      const response = await fetch(`/api/performance-metrics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch performance data');
      return response.json();
    },
    enabled: !!campaigns?.[0]?.id,
  });

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

  const getStatusStats = () => {
    if (!campaigns) return { active: 0, pending: 0, completed: 0 };
    
    return {
      active: campaigns.filter(c => c.status === 'active' || c.status === 'recruiting').length,
      pending: campaigns.filter(c => c.status === 'draft').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">광고주 대시보드</h1>
        <p className="text-gray-500">전체 현황을 한눈에 확인하고 빠르게 접근하세요</p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/dashboard/campaigns">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">캠페인 관리</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{campaigns?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">총 캠페인 수</p>
              <div className="flex items-center mt-2 text-sm text-blue-600">
                <span>캠페인 관리하기</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">성과 분석</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {performanceData ? performanceData.reduce((sum: number, metric: any) => sum + metric.qrScans, 0).toLocaleString() : '0'}
              </div>
              <p className="text-xs text-gray-500 mt-1">총 QR 스캔</p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <span>상세 분석 보기</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/billing">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">결제 관리</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">₩800K</div>
              <p className="text-xs text-gray-500 mt-1">완료된 결제</p>
              <div className="flex items-center mt-2 text-sm text-purple-600">
                <span>결제 내역 보기</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">진행중 캠페인</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">대기중 캠페인</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">완료된 캠페인</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₩{performanceData ? 
                performanceData.reduce((sum: number, metric: any) => sum + Number(metric.revenue), 0).toLocaleString() : 
                '0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Performance Summary */}
      {performanceData && performanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>이번 달 성과 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {(() => {
                const totalScans = performanceData.reduce((sum: number, metric: any) => sum + metric.qrScans, 0);
                const totalConversions = performanceData.reduce((sum: number, metric: any) => sum + metric.conversions, 0);
                const totalRevenue = performanceData.reduce((sum: number, metric: any) => sum + Number(metric.revenue), 0);
                const conversionRate = totalScans > 0 ? (totalConversions / totalScans * 100) : 0;

                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalScans.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">QR 스캔</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{totalConversions.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">전환</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{conversionRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">전환율</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">₩{totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">매출</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}