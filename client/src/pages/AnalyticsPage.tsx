import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@/types";
import { BarChart3, DollarSign, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AnalyticsPage() {
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Fetch performance metrics for the first campaign (for demo)
  const { data: performanceData, isLoading } = useQuery({
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
          <p className="text-gray-500">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">캠페인 분석</h1>
        <p className="text-gray-500">캠페인의 성과를 상세히 분석하고 인사이트를 확인하세요</p>
      </div>

      {performanceData && performanceData.length > 0 ? (
        <>
          {/* Performance Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            {(() => {
              const totalScans = performanceData.reduce((sum, metric) => sum + metric.qrScans, 0);
              const totalConversions = performanceData.reduce((sum, metric) => sum + metric.conversions, 0);
              const totalRevenue = performanceData.reduce((sum, metric) => sum + Number(metric.revenue), 0);
              const avgDeliveryRate = performanceData.reduce((sum, metric) => sum + Number(metric.deliveryRate), 0) / performanceData.length;
              const conversionRate = totalScans > 0 ? (totalConversions / totalScans * 100) : 0;

              return (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">총 QR 스캔</CardTitle>
                      <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{totalScans.toLocaleString()}</div>
                      <p className="text-xs text-gray-500 mt-1">누적 스캔 수</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">전환율</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{conversionRate.toFixed(1)}%</div>
                      <p className="text-xs text-gray-500 mt-1">{totalConversions}회 전환</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">총 매출</CardTitle>
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">₩{totalRevenue.toLocaleString()}</div>
                      <p className="text-xs text-gray-500 mt-1">누적 매출</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">배송 성공률</CardTitle>
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">{avgDeliveryRate.toFixed(1)}%</div>
                      <p className="text-xs text-gray-500 mt-1">평균 성공률</p>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* QR Scans & Conversions Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  QR 스캔 & 전환율 추이
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                      formatter={(value, name) => [
                        value,
                        name === 'qrScans' ? 'QR 스캔' : '전환'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="qrScans" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  매출 추이
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                      formatter={(value) => [`₩${Number(value).toLocaleString()}`, '매출']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#f59e0b" 
                      fill="#fbbf24" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Delivery Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  배송 성공률 추이
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, '배송 성공률']}
                    />
                    <Bar 
                      dataKey="deliveryRate" 
                      fill="#8b5cf6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>상세 성과 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const totalScans = performanceData.reduce((sum, metric) => sum + metric.qrScans, 0);
                    const totalConversions = performanceData.reduce((sum, metric) => sum + metric.conversions, 0);
                    const totalRevenue = performanceData.reduce((sum, metric) => sum + Number(metric.revenue), 0);
                    const avgDeliveryRate = performanceData.reduce((sum, metric) => sum + Number(metric.deliveryRate), 0) / performanceData.length;
                    const conversionRate = totalScans > 0 ? (totalConversions / totalScans * 100) : 0;
                    const avgRevenuePerScan = totalScans > 0 ? totalRevenue / totalScans : 0;

                    return (
                      <>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">총 QR 스캔</span>
                          <span className="font-semibold">{totalScans.toLocaleString()}회</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">총 전환</span>
                          <span className="font-semibold">{totalConversions.toLocaleString()}회</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">전환율</span>
                          <span className="font-semibold text-green-600">{conversionRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">총 매출</span>
                          <span className="font-semibold text-blue-600">₩{totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">스캔당 평균 매출</span>
                          <span className="font-semibold text-yellow-600">₩{avgRevenuePerScan.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">평균 배송 성공률</span>
                          <span className="font-semibold text-purple-600">{avgDeliveryRate.toFixed(1)}%</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">분석 데이터가 없습니다</h3>
              <p className="text-gray-500">캠페인을 시작하고 성과가 발생하면 여기에 분석 데이터가 표시됩니다.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}