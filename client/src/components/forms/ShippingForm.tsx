import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types";
import { Upload, Download } from "lucide-react";
import ExcelUpload from "@/components/ui/excel-upload";

const shippingSchema = z.object({
  campaignId: z.number().min(1, "캠페인을 선택해주세요"),
  shippingDate: z.string().min(1, "발송일을 선택해주세요"),
  trackingNumber: z.string().min(1, "운송장 번호를 입력해주세요"),
  productName: z.string().min(1, "상품명을 입력해주세요"),
  memo: z.string().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function ShippingForm() {
  const { toast } = useToast();

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  const createShippingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/shipping-records", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-records"] });
      toast({
        title: "발송 등록 완료",
        description: "발송 정보가 성공적으로 등록되었습니다.",
      });
      reset();
    },
    onError: () => {
      toast({
        title: "발송 등록 실패",
        description: "발송 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShippingFormData) => {
    createShippingMutation.mutate({
      ...data,
      shippingDate: new Date(data.shippingDate).toISOString(),
    });
  };

  const handleExcelUpload = (data: any[]) => {
    // Handle bulk upload
    console.log("Bulk upload data:", data);
    toast({
      title: "대량 등록",
      description: `${data.length}개의 발송 기록이 등록되었습니다.`,
    });
  };

  const downloadExcelTemplate = () => {
    // Create a sample Excel template
    const template = [
      {
        "캠페인선택": "캠페인 ID (숫자)",
        "발송날짜": "YYYY-MM-DD",
        "운송장번호": "123456789",
        "상품명": "샘플 상품명",
        "메모": "선택사항"
      }
    ];
    
    // In a real app, you would generate and download an actual Excel file
    toast({
      title: "템플릿 다운로드",
      description: "Excel 템플릿이 다운로드됩니다.",
    });
  };

  const activeCampaigns = campaigns?.filter(c => c.status === 'active' || c.status === 'recruiting') || [];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Single Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">단일 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="campaignId">캠페인 선택 *</Label>
              <Select onValueChange={(value) => setValue("campaignId", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="캠페인 선택" />
                </SelectTrigger>
                <SelectContent>
                  {activeCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.campaignId && (
                <p className="text-sm text-red-600 mt-1">{errors.campaignId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="shippingDate">발송날짜 *</Label>
              <Input
                id="shippingDate"
                {...register("shippingDate")}
                type="date"
              />
              {errors.shippingDate && (
                <p className="text-sm text-red-600 mt-1">{errors.shippingDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="trackingNumber">운송장 번호 *</Label>
              <Input
                id="trackingNumber"
                {...register("trackingNumber")}
                placeholder="운송장 번호"
              />
              {errors.trackingNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.trackingNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="productName">상품명 *</Label>
              <Input
                id="productName"
                {...register("productName")}
                placeholder="상품명"
              />
              {errors.productName && (
                <p className="text-sm text-red-600 mt-1">{errors.productName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="memo">메모</Label>
              <Textarea
                id="memo"
                {...register("memo")}
                placeholder="메모"
                rows={2}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createShippingMutation.isPending}
            >
              {createShippingMutation.isPending ? "등록 중..." : "등록하기"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">대량 등록 (Excel)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ExcelUpload onUpload={handleExcelUpload} />
            
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadExcelTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel 템플릿 다운로드
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                템플릿 파일을 다운로드하여 양식에 맞게 작성 후 업로드해주세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
