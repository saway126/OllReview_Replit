import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import AdvertiserDashboard from "@/components/dashboard/AdvertiserDashboard";
import PartnerDashboard from "@/components/dashboard/PartnerDashboard";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function DashboardPage() {
  const [, navigate] = useLocation();

  const { data: authData, isLoading, error } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!isLoading && (!authData?.user || error)) {
      navigate("/login");
    }
  }, [authData, error, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!authData?.user) {
    return null; // Will redirect to login via useEffect
  }

  const { user } = authData;

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'advertiser':
        return <AdvertiserDashboard />;
      case 'partner':
        return <PartnerDashboard user={user} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">알 수 없는 사용자 역할입니다.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}
