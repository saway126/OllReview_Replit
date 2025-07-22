import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Package, Truck, Search, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface ShippingRecord {
  id: number;
  campaignId: number;
  shippingDate: string;
  trackingNumber: string;
  productName: string;
  status: string;
  memo?: string;
  createdAt: string;
}

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: shippingRecords, isLoading } = useQuery<ShippingRecord[]>({
    queryKey: ["/api/shipping-records"],
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      shipped: { label: "발송됨", variant: "secondary" as const },
      in_transit: { label: "배송중", variant: "default" as const },
      delivered: { label: "배송완료", variant: "outline" as const },
      returned: { label: "반송됨", variant: "destructive" as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const };
  };

  const filteredRecords = shippingRecords?.filter(record => {
    const matchesSearch = record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.trackingNumber.includes(searchTerm);
    const matchesStatus = !statusFilter || statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusStats = () => {
    if (!shippingRecords) return { shipped: 0, in_transit: 0, delivered: 0, returned: 0 };
    return {
      shipped: shippingRecords.filter(r => r.status === 'shipped').length,
      in_transit: shippingRecords.filter(r => r.status === 'in_transit').length,
      delivered: shippingRecords.filter(r => r.status === 'delivered').length,
      returned: shippingRecords.filter(r => r.status === 'returned').length,
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
          <h1 className="text-2xl font-bold text-gray-900">발송 등록 관리</h1>
          <p className="text-gray-500">발송된 샘플의 배송 상태를 추적하고 관리합니다</p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          발송 내역 내보내기
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">발송됨</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.shipped}</div>
            <p className="text-xs text-gray-500 mt-1">발송 완료된 샘플</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">배송중</CardTitle>
            <Truck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.in_transit}</div>
            <p className="text-xs text-gray-500 mt-1">배송 중인 샘플</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">배송완료</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-xs text-gray-500 mt-1">배송 완료된 샘플</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">반송됨</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.returned}</div>
            <p className="text-xs text-gray-500 mt-1">반송된 샘플</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>발송 내역 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="제품명 또는 운송장 번호로 검색"
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
                  <SelectItem value="shipped">발송됨</SelectItem>
                  <SelectItem value="in_transit">배송중</SelectItem>
                  <SelectItem value="delivered">배송완료</SelectItem>
                  <SelectItem value="returned">반송됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle>발송 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter ? '검색 조건에 맞는 발송 내역이 없습니다.' : '등록된 발송 내역이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => {
                const statusInfo = getStatusBadge(record.status);
                
                return (
                  <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{record.productName}</h3>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">발송일:</span> {new Date(record.shippingDate).toLocaleDateString()}</p>
                            <p><span className="font-medium">운송장:</span> {record.trackingNumber}</p>
                          </div>
                          <div>
                            {record.memo && (
                              <p><span className="font-medium">메모:</span> {record.memo}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          배송 추적
                        </Button>
                        <Button size="sm">
                          상태 변경
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}