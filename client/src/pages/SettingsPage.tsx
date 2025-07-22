import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Shield, Bell, Database, Users } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          시스템 설정
        </h1>
        <p className="text-gray-500">플랫폼 전체 설정을 관리합니다</p>
      </div>

      <div className="grid gap-6">
        {/* 기본 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              기본 설정
            </CardTitle>
            <CardDescription>
              플랫폼의 기본 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">플랫폼 이름</Label>
                <Input id="platformName" defaultValue="올리뷰 (AllReview)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">지원 이메일</Label>
                <Input id="supportEmail" defaultValue="support@allreview.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">플랫폼 설명</Label>
              <Input id="description" defaultValue="프리미엄 리뷰 캠페인 및 기자단 관리 플랫폼" />
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림 설정
            </CardTitle>
            <CardDescription>
              시스템 알림 및 이메일 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">이메일 알림</Label>
                <p className="text-sm text-gray-500">새로운 캠페인 및 신청 알림</p>
              </div>
              <Switch id="emailNotifications" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsNotifications">SMS 알림</Label>
                <p className="text-sm text-gray-500">긴급 알림 및 결제 관련</p>
              </div>
              <Switch id="smsNotifications" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications">푸시 알림</Label>
                <p className="text-sm text-gray-500">브라우저 푸시 알림</p>
              </div>
              <Switch id="pushNotifications" />
            </div>
          </CardContent>
        </Card>

        {/* 사용자 관리 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              사용자 관리
            </CardTitle>
            <CardDescription>
              사용자 등록 및 권한 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoApproval">자동 승인</Label>
                <p className="text-sm text-gray-500">새 파트너 신청 자동 승인</p>
              </div>
              <Switch id="autoApproval" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minCampaignBudget">최소 캠페인 예산</Label>
                <Input id="minCampaignBudget" type="number" defaultValue="100000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionRate">수수료율 (%)</Label>
                <Input id="commissionRate" type="number" defaultValue="10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 데이터베이스 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              데이터베이스 설정
            </CardTitle>
            <CardDescription>
              데이터 보관 및 백업 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoBackup">자동 백업</Label>
                <p className="text-sm text-gray-500">매일 자동 데이터 백업</p>
              </div>
              <Switch id="autoBackup" defaultChecked />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataRetention">데이터 보관 기간 (일)</Label>
                <Input id="dataRetention" type="number" defaultValue="365" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logRetention">로그 보관 기간 (일)</Label>
                <Input id="logRetention" type="number" defaultValue="90" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            설정 저장
          </Button>
        </div>
      </div>
    </div>
  );
}