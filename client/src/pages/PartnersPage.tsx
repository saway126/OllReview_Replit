import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Users, Search, Filter, UserCheck, UserX, Mail, Building2 } from "lucide-react";
import { useState } from "react";

interface Partner {
  id: number;
  email: string;
  companyName: string;
  role: string;
  createdAt: string;
  isActive?: boolean;
  totalCampaigns?: number;
  totalEarnings?: number;
}

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const updatePartnerStatusMutation = useMutation({
    mutationFn: async ({ partnerId, isActive }: { partnerId: number; isActive: boolean }) => {
      const response = await fetch(`/api/partners/${partnerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to update partner status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
    }
  });

  const filteredPartners = partners?.filter(partner => {
    const matchesSearch = partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && partner.isActive) ||
                         (statusFilter === 'inactive' && !partner.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusStats = () => {
    if (!partners) return { total: 0, active: 0, inactive: 0 };
    
    return {
      total: partners.length,
      active: partners.filter(p => p.isActive).length,
      inactive: partners.filter(p => !p.isActive).length,
    };
  };

  const stats = getStatusStats();

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
          <h1 className="text-2xl font-bold text-gray-900">파트너 관리</h1>
          <p className="text-gray-500">등록된 파트너들을 관리하고 상태를 모니터링합니다</p>
        </div>
        <Button className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          파트너 초대
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">전체 파트너</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">등록된 파트너</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">활성 파트너</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-gray-500 mt-1">활성 상태</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">비활성 파트너</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-gray-500 mt-1">비활성 상태</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>파트너 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="이메일 또는 회사명으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status">상태 필터</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners List */}
      <Card>
        <CardHeader>
          <CardTitle>파트너 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPartners.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' ? '검색 조건에 맞는 파트너가 없습니다.' : '등록된 파트너가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPartners.map((partner) => (
                <div key={partner.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{partner.email}</span>
                        </div>
                        <Badge variant={partner.isActive ? "default" : "secondary"}>
                          {partner.isActive ? "활성" : "비활성"}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{partner.companyName || '회사명 없음'}</span>
                        </div>
                        <div>
                          <span className="font-medium">가입일:</span> {new Date(partner.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {(partner.totalCampaigns || partner.totalEarnings) && (
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">참여 캠페인:</span> {partner.totalCampaigns || 0}개
                          </div>
                          <div>
                            <span className="font-medium">총 수익:</span> ₩{(partner.totalEarnings || 0).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        상세보기
                      </Button>
                      <Button 
                        size="sm"
                        variant={partner.isActive ? "destructive" : "default"}
                        onClick={() => updatePartnerStatusMutation.mutate({
                          partnerId: partner.id,
                          isActive: !partner.isActive
                        })}
                        disabled={updatePartnerStatusMutation.isPending}
                      >
                        {partner.isActive ? "비활성화" : "활성화"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}