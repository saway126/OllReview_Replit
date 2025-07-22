import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types";
import { Eye, Edit, Trash2 } from "lucide-react";

interface CampaignTableProps {
  campaigns: Campaign[];
  onView?: (campaign: Campaign) => void;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
  showActions?: boolean;
}

export default function CampaignTable({ 
  campaigns, 
  onView, 
  onEdit, 
  onDelete, 
  showActions = true 
}: CampaignTableProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      recruiting: { label: "모집중", variant: "secondary" as const },
      active: { label: "진행중", variant: "default" as const },
      completed: { label: "완료", variant: "outline" as const },
      cancelled: { label: "취소", variant: "destructive" as const },
      draft: { label: "임시저장", variant: "secondary" as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const };
  };

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">등록된 캠페인이 없습니다.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>캠페인명</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>예산</TableHead>
          <TableHead>모집마감일</TableHead>
          {showActions && <TableHead>관리</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => {
          const statusInfo = getStatusBadge(campaign.status);
          return (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.title}</TableCell>
              <TableCell>{campaign.category}</TableCell>
              <TableCell>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </TableCell>
              <TableCell>₩ {Number(campaign.totalBudget).toLocaleString()}</TableCell>
              <TableCell>
                {new Date(campaign.recruitmentEndDate).toLocaleDateString()}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {onView && (
                      <Button variant="ghost" size="sm" onClick={() => onView(campaign)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(campaign)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(campaign)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
