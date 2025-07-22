import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, AGE_GROUPS, REGIONS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

const campaignSchema = z.object({
  title: z.string().min(1, "캠페인명을 입력해주세요"),
  description: z.string().optional(),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  dailyBudget: z.string().min(1, "일일 예산을 입력해주세요"),
  totalBudget: z.string().min(1, "총 예산을 입력해주세요"),
  recruitmentStartDate: z.string().min(1, "모집 시작일을 선택해주세요"),
  recruitmentEndDate: z.string().min(1, "모집 마감일을 선택해주세요"),
  campaignStartDate: z.string().min(1, "캠페인 시작일을 선택해주세요"),
  campaignEndDate: z.string().min(1, "캠페인 종료일을 선택해주세요"),
  maxPartners: z.number().min(1, "최대 파트너 수를 입력해주세요"),
  productUrl: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  onSuccess?: () => void;
}

export default function CampaignForm({ onSuccess }: CampaignFormProps) {
  const { toast } = useToast();
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      maxPartners: 10,
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: CampaignFormData & { targetFilters: any }) =>
      apiRequest("POST", "/api/campaigns", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "캠페인 생성 완료",
        description: "새로운 캠페인이 성공적으로 생성되었습니다.",
      });
      reset();
      setSelectedAges([]);
      setSelectedRegions([]);
      setSelectedInterests([]);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "캠페인 생성 실패",
        description: "캠페인 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    const targetFilters = {
      ages: selectedAges,
      regions: selectedRegions,
      interests: selectedInterests,
    };

    createCampaignMutation.mutate({
      ...data,
      targetFilters,
      dailyBudget: data.dailyBudget.replace(/,/g, ''),
      totalBudget: data.totalBudget.replace(/,/g, ''),
      recruitmentStartDate: new Date(data.recruitmentStartDate).toISOString(),
      recruitmentEndDate: new Date(data.recruitmentEndDate).toISOString(),
      campaignStartDate: new Date(data.campaignStartDate).toISOString(),
      campaignEndDate: new Date(data.campaignEndDate).toISOString(),
      status: 'draft',
    });
  };

  const handleAgeToggle = (age: string) => {
    setSelectedAges(prev => 
      prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
    );
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">캠페인명 *</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="캠페인 이름을 입력하세요"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">카테고리 *</Label>
          <Select onValueChange={(value) => setValue("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">캠페인 설명</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="캠페인에 대한 상세 설명을 입력하세요"
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dailyBudget">일일 예산 *</Label>
          <Input
            id="dailyBudget"
            {...register("dailyBudget")}
            placeholder="100,000"
            type="text"
          />
          {errors.dailyBudget && (
            <p className="text-sm text-red-600 mt-1">{errors.dailyBudget.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="totalBudget">총 예산 *</Label>
          <Input
            id="totalBudget"
            {...register("totalBudget")}
            placeholder="1,000,000"
            type="text"
          />
          {errors.totalBudget && (
            <p className="text-sm text-red-600 mt-1">{errors.totalBudget.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="maxPartners">최대 파트너 수</Label>
        <Input
          id="maxPartners"
          {...register("maxPartners", { valueAsNumber: true })}
          type="number"
          min={1}
        />
        {errors.maxPartners && (
          <p className="text-sm text-red-600 mt-1">{errors.maxPartners.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="productUrl">상품 URL</Label>
        <Input
          id="productUrl"
          {...register("productUrl")}
          placeholder="https://example.com/product"
          type="url"
        />
        {errors.productUrl && (
          <p className="text-sm text-red-600 mt-1">{errors.productUrl.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recruitmentStartDate">모집 시작일 *</Label>
          <Input
            id="recruitmentStartDate"
            {...register("recruitmentStartDate")}
            type="date"
          />
          {errors.recruitmentStartDate && (
            <p className="text-sm text-red-600 mt-1">{errors.recruitmentStartDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="recruitmentEndDate">모집 마감일 *</Label>
          <Input
            id="recruitmentEndDate"
            {...register("recruitmentEndDate")}
            type="date"
          />
          {errors.recruitmentEndDate && (
            <p className="text-sm text-red-600 mt-1">{errors.recruitmentEndDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="campaignStartDate">캠페인 시작일 *</Label>
          <Input
            id="campaignStartDate"
            {...register("campaignStartDate")}
            type="date"
          />
          {errors.campaignStartDate && (
            <p className="text-sm text-red-600 mt-1">{errors.campaignStartDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="campaignEndDate">캠페인 종료일 *</Label>
          <Input
            id="campaignEndDate"
            {...register("campaignEndDate")}
            type="date"
          />
          {errors.campaignEndDate && (
            <p className="text-sm text-red-600 mt-1">{errors.campaignEndDate.message}</p>
          )}
        </div>
      </div>

      {/* Target Filters */}
      <div className="space-y-4">
        <Label>타겟 필터</Label>
        
        {/* Age Groups */}
        <div>
          <Label className="text-sm">연령대 (중복 선택 가능)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAges.map((age) => (
              <Badge key={age} variant="default" className="cursor-pointer" onClick={() => handleAgeToggle(age)}>
                {age}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            <Select onValueChange={handleAgeToggle}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="+ 추가" />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.filter(age => !selectedAges.includes(age)).map((age) => (
                  <SelectItem key={age} value={age}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Regions */}
        <div>
          <Label className="text-sm">지역 (중복 선택 가능)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedRegions.map((region) => (
              <Badge key={region} variant="default" className="cursor-pointer" onClick={() => handleRegionToggle(region)}>
                {region}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            <Select onValueChange={handleRegionToggle}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="+ 추가" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.filter(region => !selectedRegions.includes(region)).map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interests */}
        <div>
          <Label className="text-sm">관심사 (중복 선택 가능)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedInterests.map((interest) => (
              <Badge key={interest} variant="default" className="cursor-pointer" onClick={() => handleInterestToggle(interest)}>
                {interest}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            <Select onValueChange={handleInterestToggle}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="+ 추가" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(category => !selectedInterests.includes(category)).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={createCampaignMutation.isPending}
      >
        {createCampaignMutation.isPending ? "생성 중..." : "캠페인 생성하기"}
      </Button>
    </form>
  );
}
