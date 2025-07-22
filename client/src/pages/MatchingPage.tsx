import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Users, Search, Star, MapPin, TrendingUp, Heart, MessageSquare } from "lucide-react";

interface Partner {
  id: number;
  email: string;
  companyName: string;
  contactPerson: string;
  bio?: string;
  website?: string;
  specialties?: string[];
  followerCount?: number;
  engagementRate?: string;
  profileImage?: string;
}

interface Campaign {
  id: number;
  title: string;
  category: string;
  dailyBudget: string;
  status: string;
}

export default function MatchingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // 파트너 목록 조회
  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/partners"],
    select: (data) => data.filter((partner: Partner) => 
      partner.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "" || partner.specialties?.includes(selectedCategory))
    )
  });

  // 내 캠페인 목록 조회 (광고주용)
  const { data: myCampaigns = [] } = useQuery({
    queryKey: ["/api/campaigns/my"]
  });

  // 파트너 초대 mutation
  const invitePartnerMutation = useMutation({
    mutationFn: async ({ partnerId, campaignId }: { partnerId: number; campaignId: number }) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/invite`, { partnerId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    }
  });

  const handleInvitePartner = (partnerId: number) => {
    if (selectedCampaignId) {
      invitePartnerMutation.mutate({ partnerId, campaignId: selectedCampaignId });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatFollowerCount = (count?: number) => {
    if (!count) return "정보 없음";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (partnersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">인플루언서 매칭</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">인플루언서를 찾고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">인플루언서 매칭</h1>
        </div>
        <Badge variant="secondary">
          {partners.length}명의 인플루언서
        </Badge>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="인플루언서 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="전문 분야 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="뷰티">뷰티</SelectItem>
                <SelectItem value="패션">패션</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="라이프스타일">라이프스타일</SelectItem>
                <SelectItem value="여행">여행</SelectItem>
                <SelectItem value="음식">음식</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCampaignId?.toString() || ""} onValueChange={(value) => setSelectedCampaignId(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="캠페인 선택" />
              </SelectTrigger>
              <SelectContent>
                {myCampaigns.map((campaign: Campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 인플루언서 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={partner.profileImage} alt={partner.companyName} />
                  <AvatarFallback>{getInitials(partner.companyName || partner.contactPerson)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{partner.companyName}</h3>
                  <p className="text-sm text-gray-600">@{partner.contactPerson}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {partner.bio && (
                <p className="text-sm text-gray-700 line-clamp-2">{partner.bio}</p>
              )}

              {/* 통계 정보 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Heart className="h-4 w-4" />
                  <span>{formatFollowerCount(partner.followerCount)} 팔로워</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>{partner.engagementRate || "N/A"}% 참여율</span>
                </div>
              </div>

              {/* 전문 분야 */}
              {partner.specialties && partner.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {partner.specialties.slice(0, 3).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {partner.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{partner.specialties.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      상세보기
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={partner.profileImage} alt={partner.companyName} />
                          <AvatarFallback>{getInitials(partner.companyName || partner.contactPerson)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-xl">{partner.companyName}</h2>
                          <p className="text-gray-600">@{partner.contactPerson}</p>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            <span className="font-semibold">팔로워</span>
                          </div>
                          <p className="text-2xl font-bold">{formatFollowerCount(partner.followerCount)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="font-semibold">참여율</span>
                          </div>
                          <p className="text-2xl font-bold">{partner.engagementRate || "N/A"}%</p>
                        </div>
                      </div>
                      
                      {partner.bio && (
                        <div>
                          <h4 className="font-semibold mb-2">소개</h4>
                          <p className="text-gray-700">{partner.bio}</p>
                        </div>
                      )}
                      
                      {partner.specialties && partner.specialties.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">전문 분야</h4>
                          <div className="flex flex-wrap gap-2">
                            {partner.specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {partner.website && (
                        <div>
                          <h4 className="font-semibold mb-2">웹사이트</h4>
                          <a 
                            href={partner.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {partner.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  onClick={() => handleInvitePartner(partner.id)}
                  disabled={!selectedCampaignId || invitePartnerMutation.isPending}
                  className="flex-1"
                >
                  {invitePartnerMutation.isPending ? "초대 중..." : "캠페인 초대"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {partners.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">검색된 인플루언서가 없습니다</h3>
            <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}