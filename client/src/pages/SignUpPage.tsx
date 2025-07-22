import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Building2, Users } from "lucide-react";

const signUpSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
  confirmPassword: z.string(),
  role: z.enum(["advertiser", "partner"], { required_error: "역할을 선택해주세요" }),
  companyName: z.string().min(1, "회사명을 입력해주세요"),
  contactPerson: z.string().min(1, "담당자명을 입력해주세요"),
  phoneNumber: z.string().min(1, "전화번호를 입력해주세요"),
  bio: z.string().optional(),
  website: z.string().optional(),
  specialties: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      contactPerson: "",
      phoneNumber: "",
      bio: "",
      website: "",
      specialties: "",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      const { confirmPassword, specialties, ...submitData } = data;
      const finalData = {
        ...submitData,
        specialties: specialties ? specialties.split(",").map(s => s.trim()) : [],
      };
      
      console.log('Sending signup data:', finalData);
      
      try {
        const response = await apiRequest("POST", "/api/auth/signup", finalData);
        
        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "회원가입에 실패했습니다";
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('Signup response:', result);
        
        if (!result.success) {
          throw new Error(result.message || '회원가입에 실패했습니다');
        }
        
        return result;
      } catch (error) {
        console.error('Signup mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Sign up success:', data);
      toast({
        title: "회원가입 성공",
        description: "대시보드로 이동합니다.",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Sign up error:", error);
      
      // Extract error message from various possible error formats
      let errorMessage = "회원가입 중 오류가 발생했습니다.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Handle HTTP error format (e.g., "400: Bad Request")
      if (errorMessage.includes(': ')) {
        const parts = errorMessage.split(': ');
        if (parts.length > 1) {
          try {
            const errorData = JSON.parse(parts[1]);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If not JSON, use the part after the colon
            errorMessage = parts.slice(1).join(': ');
          }
        }
      }
      
      toast({
        title: "회원가입 실패",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">올리뷰 회원가입</h2>
          <p className="mt-2 text-sm text-gray-600">
            광고주 또는 인플루언서로 가입하여 리뷰 캠페인에 참여하세요
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>회원 정보 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>가입 유형</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedRole(value);
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="가입 유형을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="advertiser">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              광고주 (제품 홍보)
                            </div>
                          </SelectItem>
                          <SelectItem value="partner">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              인플루언서 (리뷰어)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{selectedRole === "advertiser" ? "회사명" : "활동명/채널명"}</FormLabel>
                        <FormControl>
                          <Input placeholder={selectedRole === "advertiser" ? "ABC 컴퍼니" : "유튜브 채널명"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>비밀번호</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="6자 이상" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>비밀번호 확인</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="비밀번호 재입력" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>담당자명</FormLabel>
                        <FormControl>
                          <Input placeholder="홍길동" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>전화번호</FormLabel>
                        <FormControl>
                          <Input placeholder="010-1234-5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedRole === "partner" && (
                  <>
                    <FormField
                      control={form.control}
                      name="specialties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>전문 분야 (쉼표로 구분)</FormLabel>
                          <FormControl>
                            <Input placeholder="뷰티, 패션, IT, 라이프스타일" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>웹사이트/블로그 (선택)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://blog.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedRole === "advertiser" ? "회사 소개" : "자기소개"}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={selectedRole === "advertiser" ? "회사에 대해 간단히 설명해주세요" : "본인과 활동에 대해 소개해주세요"}
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {signUpMutation.error && (
                  <div className="text-red-600 text-sm">
                    회원가입 중 오류가 발생했습니다. 다시 시도해주세요.
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? "가입 중..." : "회원가입"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => setLocation("/login")}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}