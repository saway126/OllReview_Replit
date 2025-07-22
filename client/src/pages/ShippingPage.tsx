import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Truck, Package, Upload } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const shippingRecordSchema = z.object({
  campaignId: z.number().min(1, "캠페인을 선택해주세요"),
  shippingDate: z.string().min(1, "발송일을 선택해주세요"),
  productName: z.string().min(1, "제품명을 입력해주세요"),
  trackingNumber: z.string().min(1, "운송장 번호를 입력해주세요"),
  memo: z.string().optional(),
});

interface Campaign {
  id: number;
  title: string;
  status: string;
}

export default function ShippingPage() {
  const [bulkData, setBulkData] = useState('');

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const form = useForm({
    resolver: zodResolver(shippingRecordSchema),
    defaultValues: {
      campaignId: 0,
      shippingDate: "",
      productName: "",
      trackingNumber: "",
      memo: "",
    },
  });

  const createShippingRecordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof shippingRecordSchema>) => {
      return apiRequest("/api/shipping-records", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-records"] });
      form.reset();
    },
  });

  const createBulkShippingMutation = useMutation({
    mutationFn: async (records: any[]) => {
      return apiRequest("/api/shipping-records/bulk", {
        method: "POST",
        body: JSON.stringify({ records }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-records"] });
      setBulkData('');
    },
  });

  const handleBulkUpload = () => {
    if (!bulkData.trim()) return;
    
    const lines = bulkData.trim().split('\n');
    const data = lines.map(line => {
      const [shippingDate, trackingNumber, productName, memo] = line.split('\t');
      return {
        campaignId: campaigns?.[0]?.id || 1, // 첫 번째 캠페인 사용
        shippingDate,
        trackingNumber,
        productName,
        memo: memo || ''
      };
    });
    
    createBulkShippingMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">발송 계획 관리</h1>
          <p className="text-gray-500">샘플 제품의 발송 계획을 수립하고 관리합니다</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 개별 발송 등록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              개별 발송 등록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createShippingRecordMutation.mutate(data))} className="space-y-4">
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
                  name="shippingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>발송일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                        <Input placeholder="발송할 제품명을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trackingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>운송장 번호</FormLabel>
                      <FormControl>
                        <Input placeholder="운송장 번호를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>메모</FormLabel>
                      <FormControl>
                        <Textarea placeholder="추가 메모사항" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createShippingRecordMutation.isPending}>
                  <Truck className="h-4 w-4 mr-2" />
                  {createShippingRecordMutation.isPending ? "등록 중..." : "발송 등록"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* 일괄 발송 등록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              일괄 발송 등록
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>데이터 형식</Label>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-mono">발송일 [TAB] 운송장번호 [TAB] 제품명 [TAB] 메모</p>
                <p className="mt-1 text-xs">예시: 2024-01-15      123456789       샘플 상품   테스트</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulkData">발송 데이터 입력</Label>
              <Textarea 
                id="bulkData"
                placeholder="탭으로 구분된 발송 데이터를 붙여넣으세요"
                rows={8}
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleBulkUpload}
              disabled={!bulkData.trim() || createBulkShippingMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {createBulkShippingMutation.isPending ? "등록 중..." : "일괄 등록"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 발송 계획 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            이번 주 발송 계획
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600">
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div>토</div>
              <div>일</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <Card key={day} className="p-3 min-h-[100px]">
                  <div className="text-lg font-semibold text-gray-900">{day + 14}</div>
                  {day === 1 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        샘플 상품 1 (5개)
                      </div>
                    </div>
                  )}
                  {day === 3 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        샘플 상품 2 (3개)
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}