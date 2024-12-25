// components/staff/export-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportEmployeesToCsv, downloadCsv } from "@/lib/utils/csv-export";

export function ExportButton() {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const csvContent = await exportEmployeesToCsv();
      const filename = `staff-export-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsv(csvContent, filename);

      toast({
        title: "Export Successful",
        description: "Staff data has been exported to CSV",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export staff data",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Export Staff
    </Button>
  );
}