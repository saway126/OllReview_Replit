import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Campaign, SampleProduct, User } from "@/types";
import { Package, Truck, FileText, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import ShippingForm from "@/components/forms/ShippingForm";

interface PartnerDashboardProps {
  user: User;
}

export default function PartnerDashboard({ user }: PartnerDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: sampleProducts, isLoading: samplesLoading } = useQuery<SampleProduct[]>({
    queryKey: ["/api/sample-products"],
  });

  if (campaignsLoading || samplesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "대기중", variant: "secondary" as const },
      approved: { label: "승인", variant: "default" as const },
      shipped: { label: "발송완료", variant: "outline" as const },
      delivered: { label: "배송완료", variant: "destructive" as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            파트너 : {user.companyName || user.email}
          </h1>
          <p className="text-gray-500">파트너 대시보드에 오신 것을 환영합니다</p>
        </div>
        <Button>
          캠페인 신청하기
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sample Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Package className="h-5 w-5 text-primary mr-2" />
              샘플 업체
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sampleProducts && sampleProducts.length > 0 ? (
              <div className="space-y-3">
                {sampleProducts.slice(0, 3).map((sample) => {
                  const statusInfo = getStatusBadge(sample.status);
                  return (
                    <div key={sample.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{sample.productName}</span>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {sample.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 text-xs">
                            승인
                          </Button>
                          <Button size="sm" variant="secondary" className="flex-1 text-xs">
                            거절
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">요청된 샘플이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Truck className="h-5 w-5 text-primary mr-2" />
              발송 계획
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">희망 카테고리</label>
                <select className="w-full text-sm border border-gray-300 rounded px-2 py-1">
                  <option>뷰티/화장품</option>
                  <option>식품/건강</option>
                  <option>패션/의류</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">예상 수량</label>
                <input 
                  type="number" 
                  placeholder="1000" 
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1" 
                />
              </div>
              <Button size="sm" className="w-full">
                계획 등록
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <TrendingUp className="h-5 w-5 text-primary mr-2" />
              수익 리포트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">기간 선택</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>발송 완료</span>
                  <span className="font-medium">0건</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>수익금</span>
                  <span className="font-medium text-green-600">₩ 0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>신청 가능한 캠페인</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns
                .filter(campaign => campaign.status === 'recruiting')
                .map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div>카테고리: {campaign.category}</div>
                      <div>예산: ₩ {Number(campaign.dailyBudget).toLocaleString()}/일</div>
                      <div>모집마감: {new Date(campaign.recruitmentEndDate).toLocaleDateString()}</div>
                    </div>
                    <Button size="sm" className="w-full">
                      신청하기
                    </Button>
                  </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">현재 신청 가능한 캠페인이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 text-primary mr-2" />
            발송 등록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ShippingForm />
        </CardContent>
      </Card>
    </div>
  );
}
