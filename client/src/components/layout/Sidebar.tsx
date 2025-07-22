import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Megaphone, 
  BarChart3, 
  CreditCard,
  Package,
  Truck,
  FileText,
  TrendingUp,
  Users,
  Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { User } from "@/types";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const getMenuItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
          { href: '/dashboard/campaigns', icon: Megaphone, label: '캠페인 관리' },
          { href: '/dashboard/partners', icon: Users, label: '파트너 관리' },
          { href: '/dashboard/analytics', icon: BarChart3, label: '성과 분석' },
          { href: '/dashboard/billing', icon: CreditCard, label: '정산 관리' },
          { href: '/dashboard/settings', icon: Settings, label: '설정' },
        ];
      case 'advertiser':
        return [
          { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
          { href: '/dashboard/campaigns', icon: Megaphone, label: '캠페인' },
          { href: '/dashboard/analytics', icon: BarChart3, label: '분석' },
          { href: '/dashboard/billing', icon: CreditCard, label: '결제' },
        ];
      case 'partner':
        return [
          { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
          { href: '/dashboard/samples', icon: Package, label: '샘플업체' },
          { href: '/dashboard/shipping', icon: Truck, label: '발송계획' },
          { href: '/dashboard/records', icon: FileText, label: '발송등록' },
          { href: '/dashboard/revenue', icon: TrendingUp, label: '수익리포트' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {user.role === 'admin' ? '관리자 메뉴' : 
           user.role === 'advertiser' ? '광고주 메뉴' : '파트너 메뉴'}
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + '/');
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
