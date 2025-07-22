import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  CreditCard, 
  Edit, 
  Share2, 
  Handshake, 
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  Megaphone,
  CheckCircle,
  Clock,
  Package,
  Truck,
  FileText,
  Calendar
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function HomePage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'admin' | 'advertiser' | 'partner'>('admin');
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: Search,
      title: "최적화 블로그 섭외",
      description: "키워드별 최적화된 블로그를 자동으로 분류하고 매칭하여 효율적인 섭외가 가능합니다.",
      color: "text-primary"
    },
    {
      icon: CreditCard,
      title: "자동입찰 및 결제",
      description: "스마트 입찰 시스템과 안전한 결제 시스템으로 투명하고 효율적인 거래를 보장합니다.",
      color: "text-green-600"
    },
    {
      icon: Edit,
      title: "상위노출 원고 생성",
      description: "AI 기반 콘텐츠 생성 도구로 검색 최적화된 고품질 원고를 자동 생성합니다.",
      color: "text-amber-600"
    },
    {
      icon: Share2,
      title: "자동 SNS 공유",
      description: "다양한 SNS 플랫폼으로의 자동 콘텐츠 배포 및 확산 기능을 제공합니다.",
      color: "text-red-600"
    },
    {
      icon: Handshake,
      title: "다이렉트 매칭",
      description: "광고주와 카테고리별 최적화 블로그를 직접 연결하는 스마트 매칭 시스템입니다.",
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      title: "실시간 분석",
      description: "QR 코드 추적, 전환율 분석 등 실시간 성과 데이터를 제공합니다.",
      color: "text-green-600"
    }
  ];

  const pricingPlans = [
    {
      name: "스타터",
      price: "99,000",
      description: "개인 및 소규모 프로젝트",
      features: [
        "월 10개 캠페인",
        "기본 분석 리포트",
        "이메일 지원"
      ],
      isPopular: false
    },
    {
      name: "프로페셔널",
      price: "299,000",
      description: "성장하는 비즈니스",
      features: [
        "월 50개 캠페인",
        "고급 분석 및 인사이트",
        "전화 지원",
        "API 접근"
      ],
      isPopular: true
    },
    {
      name: "엔터프라이즈",
      price: "맞춤 견적",
      description: "대규모 조직",
      features: [
        "무제한 캠페인",
        "전담 계정 매니저",
        "24/7 지원",
        "커스텀 통합"
      ],
      isPopular: false
    }
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      navigate("/login");
    }
  };

  const scrollToDemo = () => {
    const demoSection = document.getElementById('dashboards');
    demoSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            프리미엄 체험단 및 기자단
            <span className="text-primary block mt-2">통합 플랫폼</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            최적화된 블로그 매칭부터 자동화된 캠페인 관리까지, 
            광고주와 파트너를 연결하는 차세대 마케팅 솔루션
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/login")}>
              무료로 시작하기
            </Button>
            <Button variant="outline" size="lg" onClick={scrollToDemo}>
              데모 보기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">핵심 기능</h3>
            <p className="text-gray-600 text-lg">올리뷰 플랫폼의 강력한 기능들을 살펴보세요</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`text-xl ${feature.color}`} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboards" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">3가지 전용 대시보드</h3>
            <p className="text-gray-600 text-lg">역할별로 최적화된 인터페이스로 효율적인 업무 환경을 제공합니다</p>
          </div>

          {/* Dashboard Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button 
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'admin' ? 'bg-white text-primary' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('admin')}
              >
                관리자 대시보드
              </button>
              <button 
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'advertiser' ? 'bg-white text-primary' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('advertiser')}
              >
                광고주 대시보드
              </button>
              <button 
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'partner' ? 'bg-white text-primary' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('partner')}
              >
                파트너 대시보드
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="bg-gray-50 rounded-xl p-8">
            {activeTab === 'admin' && (
              <div className="grid lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">총 캠페인</p>
                        <p className="text-2xl font-bold text-gray-900">127</p>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Megaphone className="text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">활성 파트너</p>
                        <p className="text-2xl font-bold text-gray-900">1,543</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">월 매출</p>
                        <p className="text-2xl font-bold text-gray-900">₩ 24.5M</p>
                      </div>
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">성공률</p>
                        <p className="text-2xl font-bold text-gray-900">94.2%</p>
                      </div>
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'advertiser' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>새 캠페인 생성</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input 
                        placeholder="캠페인 이름을 입력하세요" 
                        value="신제품 블로그 리뷰 캠페인"
                        readOnly
                        className="bg-gray-50"
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input 
                          placeholder="카테고리" 
                          value="뷰티/화장품"
                          readOnly
                          className="bg-gray-50"
                        />
                        <Input 
                          placeholder="일일 예산" 
                          value="50,000원"
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">20-30대</Badge>
                        <Badge variant="secondary">서울/경기</Badge>
                        <Badge variant="secondary">뷰티 관심사</Badge>
                        <Button variant="outline" size="sm">+ 추가</Button>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate("/login")}
                      >
                        캠페인 생성하기 (로그인 필요)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">캠페인 현황</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-gray-600">진행중</span>
                        </div>
                        <span className="font-semibold text-green-600">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-amber-600 mr-2" />
                          <span className="text-sm text-gray-600">대기중</span>
                        </div>
                        <span className="font-semibold text-amber-600">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">완료</span>
                        </div>
                        <span className="font-semibold text-gray-400">15</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">이번 달 성과</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">QR 스캔수</span>
                        <span className="font-semibold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">전환수</span>
                        <span className="font-semibold">189</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">전환율</span>
                        <span className="font-semibold text-green-600">15.2%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'partner' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Package className="h-5 w-5 text-primary mr-2" />
                      샘플 업체
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">뷰티코스메틱 신제품</span>
                          <Badge variant="secondary" className="text-xs">대기중</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">일일예산: 50,000원 | 기간: 7일</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs"
                            onClick={() => navigate("/login")}
                          >
                            지원하기
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs">상세보기</Button>
                        </div>
                      </div>
                      
                      <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">홈케어 브랜드 체험</span>
                          <Badge className="text-xs bg-green-600">진행중</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">일일예산: 30,000원 | 남은기간: 3일</p>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          리뷰 작성하기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Truck className="h-5 w-5 text-primary mr-2" />
                      발송 계획
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">희망 카테고리</label>
                        <Input 
                          value="뷰티/화장품" 
                          readOnly
                          className="text-sm bg-gray-50" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">월 발송 가능 수량</label>
                        <Input 
                          value="1,500개" 
                          readOnly
                          className="text-sm bg-gray-50" 
                        />
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>이번 달 진행:</span>
                          <span className="font-medium">850/1,500</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{width: '57%'}}></div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate("/login")}
                      >
                        용량 업데이트
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <BarChart3 className="h-5 w-5 text-primary mr-2" />
                      수익 리포트
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">조회 기간</label>
                        <Input 
                          value="2025년 7월" 
                          readOnly
                          className="text-sm bg-gray-50" 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>발송 완료</span>
                          <span className="font-medium">342건</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>완료율</span>
                          <span className="font-medium text-green-600">94.2%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>총 수익금</span>
                          <span className="font-medium text-green-600">₩ 1,026,000</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>평균 건당 수익</span>
                            <span>₩ 3,000</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate("/login")}
                      >
                        상세 리포트 보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">요금제</h3>
            <p className="text-gray-600 text-lg">귀하의 비즈니스에 맞는 최적의 플랜을 선택하세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.isPopular ? 'border-2 border-primary' : ''}`}>
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">인기</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-gray-600">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price.includes('₩') ? plan.price : `₩${plan.price}`}
                    </span>
                    {!plan.price.includes('맞춤') && <span className="text-gray-600">/월</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.isPopular ? "default" : "outline"}
                    onClick={() => navigate("/login")}
                  >
                    {plan.price.includes('맞춤') ? '문의하기' : '시작하기'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">지금 시작하세요</h3>
          <p className="text-gray-600 text-lg mb-8">
            올리뷰 플랫폼으로 더 효율적인 마케팅을 경험해보세요
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="이메일 주소를 입력하세요" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              무료 체험 시작
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-4">
            신용카드 정보 없이 14일 무료 체험 가능
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">올리뷰</h4>
              <p className="text-gray-400 text-sm mb-4">
                프리미엄 체험단 및 기자단 통합 플랫폼으로 효율적인 마케팅 솔루션을 제공합니다.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">서비스</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">캠페인 관리</Link></li>
                <li><Link href="#dashboards" className="hover:text-white transition-colors">파트너 매칭</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">성과 분석</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">결제 시스템</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">지원</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">도움말 센터</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API 문서</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개발자 가이드</a></li>
                <li><a href="#" className="hover:text-white transition-colors">고객 지원</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">회사</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">회사 소개</a></li>
                <li><a href="#" className="hover:text-white transition-colors">채용 정보</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 올리뷰(AllReview). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
