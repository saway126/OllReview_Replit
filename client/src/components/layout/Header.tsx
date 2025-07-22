import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User as UserType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Header() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: authData, isLoading } = useQuery<{ user: UserType }>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      navigate("/");
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">올리뷰</h1>
                <p className="text-xs text-gray-500">AllReview Platform</p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-primary"
              >
                홈
              </Button>
              {authData?.user && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-600 hover:text-primary"
                  >
                    대시보드
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/dashboard/campaigns")}
                    className="text-gray-600 hover:text-primary"
                  >
                    캠페인
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/dashboard/analytics")}
                    className="text-gray-600 hover:text-primary"
                  >
                    분석
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/dashboard/billing")}
                    className="text-gray-600 hover:text-primary"
                  >
                    결제
                  </Button>
                  {authData.user.role === 'admin' && (
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate("/dashboard/settings")}
                      className="text-gray-600 hover:text-primary"
                    >
                      설정
                    </Button>
                  )}
                </>
              )}
            </nav>
          </div>

          {authData?.user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {authData.user.role === 'partner' && authData.user.companyName 
                      ? `파트너 : ${authData.user.companyName}`
                      : authData.user.companyName || authData.user.email
                    }
                  </div>
                  <div className="text-gray-500 capitalize">
                    {authData.user.role === 'admin' ? '관리자' : 
                     authData.user.role === 'advertiser' ? '광고주' : '파트너'}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                로그인
              </Button>
              <Button onClick={() => navigate("/login")}>
                회원가입
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
