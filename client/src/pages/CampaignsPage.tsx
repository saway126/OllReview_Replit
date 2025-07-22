import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@/types";
import { Plus, Clock, CheckCircle, TrendingUp } from "lucide-react";
import CampaignForm from "@/components/forms/CampaignForm";
import { useState } from "react";

export default function CampaignsPage() {
  const [showCampaignForm, setShowCampaignForm] = useState(false);

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      recruiting: { label: "모집중", variant: "secondary" as const },
      active: { label: "진행중", variant: "default" as const },
      completed: { label: "완료", variant: "outline" as const },
      cancelled: { label: "취소", variant: "destructive" as const },
      draft: { label: "임시저장", variant: "secondary" as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const };
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">캠페인 관리</h1>
          <p className="text-gray-500">캠페인을 생성하고 관리하세요</p>
        </div>
        <Button onClick={() => setShowCampaignForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 캠페인 생성
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid md:grid-cols-3 gap-6">
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
      </div>

      {/* Campaign Creation Form */}
      {showCampaignForm && (
        <Card>
          <CardHeader>
            <CardTitle>새 캠페인 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignForm onSuccess={() => setShowCampaignForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>모든 캠페인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((campaign) => {
                const badgeInfo = getStatusBadge(campaign.status);
                return (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>예산: ₩{Number(campaign.totalBudget).toLocaleString()}</span>
                        <span>일일예산: ₩{Number(campaign.dailyBudget).toLocaleString()}</span>
                        <span>카테고리: {campaign.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                      <Button variant="outline" size="sm">
                        관리
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">생성된 캠페인이 없습니다</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}