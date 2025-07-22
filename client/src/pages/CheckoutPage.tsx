import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { CreditCard, Shield, CheckCircle, ArrowLeft } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

interface CheckoutFormProps {
  campaignId: number;
  amount: number;
  onSuccess: () => void;
}

function CheckoutForm({ campaignId, amount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest("POST", "/api/payments/process", {
        campaignId,
        amount: amount * 100, // Convert to cents
        paymentMethodId
      });
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      setError("결제 처리 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("카드 정보를 입력해주세요.");
      setIsProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message || "카드 정보가 올바르지 않습니다.");
        setIsProcessing(false);
        return;
      }

      if (paymentMethod) {
        paymentMutation.mutate(paymentMethod.id);
      }
    } catch (err) {
      setError("결제 처리 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카드 정보
        </label>
        <div className="bg-white border border-gray-300 rounded-md p-3">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        <span>결제 정보는 안전하게 암호화되어 처리됩니다</span>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "결제 처리 중..." : `₩${amount.toLocaleString()} 결제하기`}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // URL에서 campaignId와 amount 파라미터 추출
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = Number(urlParams.get('campaignId'));
  const amount = Number(urlParams.get('amount'));

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["/api/campaigns", campaignId],
    enabled: !!campaignId
  });

  useEffect(() => {
    if (!campaignId || !amount) {
      setLocation("/campaigns");
    }
  }, [campaignId, amount, setLocation]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">캠페인 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다!</h1>
            <p className="text-gray-600 mb-6">
              캠페인이 성공적으로 시작되었습니다. 대시보드에서 진행 상황을 확인하실 수 있습니다.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setLocation("/campaigns")} className="w-full">
                캠페인 대시보드로 이동
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")}>
                홈으로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/campaigns")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          캠페인으로 돌아가기
        </Button>
        
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-6 w-6" />
          <h1 className="text-2xl font-bold">캠페인 결제</h1>
        </div>
        <p className="text-gray-600">안전한 결제로 캠페인을 시작하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 주문 요약 */}
        <Card>
          <CardHeader>
            <CardTitle>주문 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaign && (
              <>
                <div>
                  <h3 className="font-semibold">{campaign.title}</h3>
                  <p className="text-sm text-gray-600">{campaign.description}</p>
                  <Badge className="mt-2">{campaign.category}</Badge>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>일일 예산</span>
                    <span>₩{Number(campaign.dailyBudget).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>총 예산</span>
                    <span>₩{Number(campaign.totalBudget).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>결제 금액</span>
                    <span>₩{amount.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 결제 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>결제 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                campaignId={campaignId}
                amount={amount}
                onSuccess={() => setPaymentComplete(true)}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>

      {/* 보안 정보 */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">안전한 결제</h4>
              <p className="text-sm text-gray-600">
                모든 결제 정보는 Stripe를 통해 안전하게 처리되며, 올리뷰는 귀하의 카드 정보를 저장하지 않습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}