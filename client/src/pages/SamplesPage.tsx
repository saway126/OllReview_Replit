import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Package, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface SampleProduct {
  id: number;
  campaignId: number;
  partnerId: number;
  productName: string;
  quantity: number;
  requestedAt: string;
  status: string;
  approvedAt?: string;
  notes?: string;
  trackingNumber?: string;
}

interface Campaign {
  id: number;
  title: string;
  status: string;
}

const sampleRequestSchema = z.object({
  campaignId: z.number().min(1, "캠페인을 선택해주세요"),
  productName: z.string().min(1, "제품명을 입력해주세요"),
  quantity: z.number().min(1, "수량은 1개 이상이어야 합니다"),
  notes: z.string().optional(),
});

export default function SamplesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: samples, isLoading } = useQuery<SampleProduct[]>({
    queryKey: ["/api/sample-products"],
  });

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const form = useForm({
    resolver: zodResolver(sampleRequestSchema),
    defaultValues: {
      campaignId: 0,
      productName: "",
      quantity: 1,
      notes: "",
    },
  });

  const createSampleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sampleRequestSchema>) => {
      return apiRequest("/api/sample-products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sample-products"] });
      setIsDialogOpen(false);
      form.reset();
    },
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
      pending: { label: "승인 대기", variant: "secondary" as const, icon: Clock },
      approved: { label: "승인됨", variant: "default" as const, icon: CheckCircle },
      shipped: { label: "발송됨", variant: "outline" as const, icon: Package },
      rejected: { label: "거절됨", variant: "destructive" as const, icon: AlertCircle },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const, icon: Clock };
  };

  const getStatusStats = () => {
    if (!samples) return { pending: 0, approved: 0, shipped: 0 };
    
    return {
      pending: samples.filter(s => s.status === 'pending').length,
      approved: samples.filter(s => s.status === 'approved').length,
      shipped: samples.filter(s => s.status === 'shipped').length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">샘플 업체 관리</h1>
          <p className="text-gray-500">요청한 샘플 제품을 관리하고 추적합니다</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              새 샘플 요청
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>샘플 제품 요청</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createSampleMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="campaignId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>캠페인 선택</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="캠페인을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campaigns?.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id.toString()}>
                              {campaign.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제품명</FormLabel>
                      <FormControl>
                        <Input placeholder="샘플 제품명을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>수량</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>추가 메모 (선택사항)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="특별한 요청사항이 있으면 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={createSampleMutation.isPending}>
                    {createSampleMutation.isPending ? "요청 중..." : "샘플 요청"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">승인 대기</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">승인 대기 중인 샘플</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">승인됨</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-gray-500 mt-1">승인된 샘플</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">발송됨</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.shipped}</div>
            <p className="text-xs text-gray-500 mt-1">발송된 샘플</p>
          </CardContent>
        </Card>
      </div>

      {/* Samples List */}
      <Card>
        <CardHeader>
          <CardTitle>샘플 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {!samples || samples.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">요청한 샘플이 없습니다.</p>
              <DialogTrigger asChild>
                <Button className="mt-4" variant="outline">
                  첫 샘플 요청하기
                </Button>
              </DialogTrigger>
            </div>
          ) : (
            <div className="space-y-4">
              {samples.map((sample) => {
                const statusInfo = getStatusBadge(sample.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={sample.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{sample.productName}</h3>
                          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>수량: {sample.quantity}개</p>
                          <p>요청일: {new Date(sample.requestedAt).toLocaleDateString()}</p>
                          {sample.approvedAt && (
                            <p>승인일: {new Date(sample.approvedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                        {sample.notes && (
                          <p className="mt-2 text-sm text-gray-500 italic">{sample.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          상세보기
                        </Button>
                        {sample.status === 'approved' && (
                          <Button size="sm">
                            배송 정보 입력
                          </Button>
                        )}
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