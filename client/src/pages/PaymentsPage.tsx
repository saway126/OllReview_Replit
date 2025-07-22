import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { CreditCard, DollarSign, Receipt, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";

interface Payment {
  id: number;
  campaignId: number;
  advertiserId: number;
  amount: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
}

export default function PaymentsPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error('Payment failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setShowPaymentForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">결제 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "대기중", variant: "secondary" as const, icon: Clock },
      completed: { label: "완료", variant: "default" as const, icon: CheckCircle },
      failed: { label: "실패", variant: "destructive" as const, icon: XCircle },
      refunded: { label: "환불", variant: "outline" as const, icon: Receipt },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const, icon: Clock };
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodMap = {
      card: { label: "카드", color: "bg-blue-100 text-blue-700" },
      bank_transfer: { label: "계좌이체", color: "bg-green-100 text-green-700" },
      virtual_account: { label: "가상계좌", color: "bg-purple-100 text-purple-700" },
    };
    return methodMap[method as keyof typeof methodMap] || { label: method, color: "bg-gray-100 text-gray-700" };
  };

  const getTotalStats = () => {
    if (!payments) return { total: 0, completed: 0, pending: 0, failed: 0 };
    
    return {
      total: payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      completed: payments.filter(p => p.status === 'completed').reduce((sum, payment) => sum + Number(payment.amount), 0),
      pending: payments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + Number(payment.amount), 0),
      failed: payments.filter(p => p.status === 'failed').length,
    };
  };

  const stats = getTotalStats();

  const handlePayment = (formData: FormData) => {
    const paymentData = {
      campaignId: parseInt(formData.get('campaignId') as string),
      amount: formData.get('amount') as string,
      paymentMethod: formData.get('paymentMethod') as string,
    };
    paymentMutation.mutate(paymentData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">결제 관리</h1>
          <p className="text-gray-500">결제 내역을 확인하고 새로운 결제를 진행하세요</p>
        </div>
        <Button onClick={() => setShowPaymentForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 결제
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 결제액</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₩{stats.total.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">누적 결제 금액</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">완료된 결제</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₩{stats.completed.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">성공 결제 금액</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">대기중 결제</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₩{stats.pending.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">처리 대기 금액</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">실패한 결제</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-gray-500 mt-1">실패 건수</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <Card>
          <CardHeader>
            <CardTitle>새 결제 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handlePayment(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    캠페인 ID
                  </label>
                  <input
                    name="campaignId"
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="캠페인 ID를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    결제 금액
                  </label>
                  <input
                    name="amount"
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="결제 금액을 입력하세요"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제 방법
                </label>
                <select
                  name="paymentMethod"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">결제 방법을 선택하세요</option>
                  <option value="card">신용카드</option>
                  <option value="bank_transfer">계좌이체</option>
                  <option value="virtual_account">가상계좌</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={paymentMutation.isPending}
                  className="flex-1"
                >
                  {paymentMutation.isPending ? "처리중..." : "결제 진행"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPaymentForm(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments && payments.length > 0 ? (
              payments.map((payment) => {
                const statusInfo = getStatusBadge(payment.status);
                const methodInfo = getPaymentMethodBadge(payment.paymentMethod);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-4 w-4" />
                        <h4 className="font-medium text-gray-900">
                          캠페인 #{payment.campaignId} 결제
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodInfo.color}`}>
                          {methodInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>결제일: {new Date(payment.createdAt).toLocaleDateString('ko-KR')}</span>
                        {payment.processedAt && (
                          <span>처리일: {new Date(payment.processedAt).toLocaleDateString('ko-KR')}</span>
                        )}
                        {payment.transactionId && (
                          <span>거래번호: {payment.transactionId}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ₩{Number(payment.amount).toLocaleString()}
                        </div>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 내역이 없습니다</h3>
                <p className="text-gray-500 mb-4">첫 번째 결제를 진행해보세요.</p>
                <Button onClick={() => setShowPaymentForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  새 결제
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}