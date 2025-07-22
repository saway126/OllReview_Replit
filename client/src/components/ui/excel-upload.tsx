import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExcelUploadProps {
  onUpload: (data: any[]) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export default function ExcelUpload({ 
  onUpload, 
  accept = ".xlsx,.xls,.csv",
  maxSize = 10 
}: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: "잘못된 파일 형식",
        description: "Excel 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: `파일 크기는 ${maxSize}MB 이하여야 합니다.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // For demonstration purposes, we'll simulate parsing
      // In a real application, you would use a library like SheetJS (xlsx) to parse the file
      
      // Simulate async file processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock parsed data - in reality, this would come from parsing the Excel file
      const mockData = [
        {
          campaignId: 1,
          shippingDate: "2024-01-15",
          trackingNumber: "123456789",
          productName: "샘플 상품 1",
          memo: "테스트 메모"
        },
        {
          campaignId: 1,
          shippingDate: "2024-01-16",
          trackingNumber: "987654321",
          productName: "샘플 상품 2",
          memo: ""
        }
      ];

      onUpload(mockData);
      
      toast({
        title: "파일 업로드 완료",
        description: `${mockData.length}개의 레코드가 처리되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "파일 처리 실패",
        description: "파일을 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, maxSize, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-gray-300 hover:border-gray-400"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        id="excel-upload"
        disabled={isUploading}
      />
      
      <div className="space-y-3">
        {isUploading ? (
          <>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-600">파일을 처리하는 중...</p>
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Excel 파일을 드래그하거나 클릭하여 업로드
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("excel-upload")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                파일 선택
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              지원 형식: .xlsx, .xls, .csv (최대 {maxSize}MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
